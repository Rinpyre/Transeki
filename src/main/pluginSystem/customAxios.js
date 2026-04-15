import axios from 'axios'
import { createScraper, SCRAPER_USER_AGENT } from './scraper.js'
import { createModuleLogger } from '@logger'

const logger = createModuleLogger('PluginAxios')

// The global state for cookies and our CF window lock
export const cookieJar = {}
// We use an object to store promises per-domain, so different extensions don't block each other!
const cfSolvePromises = {}

// Create the base instance
export const pluginAxios = axios.create({
    headers: { 'User-Agent': SCRAPER_USER_AGENT }
})

// REQUEST INTERCEPTOR: Automatically inject cookies based on the domain
pluginAxios.interceptors.request.use((config) => {
    if (!config.url) return config
    const url = new URL(config.url, config.baseURL)

    if (cookieJar[url.hostname]) {
        config.headers['Cookie'] = cookieJar[url.hostname]
    }
    return config
})

// RESPONSE INTERCEPTOR: The Cloudflare Auto-Solver
pluginAxios.interceptors.response.use(
    (response) => response, // Request succeeded normally
    async (error) => {
        const isCfBlock =
            error.response && (error.response.status === 403 || error.response.status === 503)

        // We check the boolean we injected directly into the config!
        if (isCfBlock && error.config && error.config.__cfProtected) {
            const pluginId = error.config.__pluginId

            // error.config.url might be a relative path, so we safely parse it using baseURL
            const targetUrl = new URL(error.config.url, error.config.baseURL)
            const baseUrl = targetUrl.origin // Gives us 'https://mangafire.to'
            const hostname = targetUrl.hostname // Gives us 'mangafire.to'

            logger.warn(
                `Cloudflare block detected for [${pluginId}] at ${baseUrl}. Attempting auto-solve...`
            )

            // If no hidden window is currently solving CF FOR THIS SPECIFIC DOMAIN, start one
            if (!cfSolvePromises[hostname]) {
                const tempScraper = createScraper(null, cookieJar)
                cfSolvePromises[hostname] = tempScraper
                    .solve({ url: baseUrl, waitForCf: true })
                    .finally(() => {
                        // Clear the lock for this domain when finished
                        delete cfSolvePromises[hostname]
                    })
            }

            try {
                // Wait for the window to finish clearing the CF challenge for this domain
                await cfSolvePromises[hostname]
                logger.info(`Cloudflare solved for [${pluginId}]. Retrying original request...`)

                // The request interceptor will automatically attach the newly saved cookies on retry!
                return pluginAxios.request(error.config)
            } catch (err) {
                logger.error(`Failed to auto-solve Cloudflare for [${pluginId}]:`, err)
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)

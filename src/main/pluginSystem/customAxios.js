import axios from 'axios'
import { createScraper, SCRAPER_USER_AGENT } from './scraper.js'
import { createModuleLogger } from '@logger'

const logger = createModuleLogger('PluginAxios')

export const cookieJar = {}
const cfSolvePromises = {}

// Create the base instance of Axios that plugins will use
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
        let isCfBlock = false

        if (error.response && (error.response.status === 403 || error.response.status === 503)) {
            let dataStr = ''

            if (error.response.data instanceof ArrayBuffer) {
                dataStr = Buffer.from(error.response.data).toString('utf8')
            } else if (typeof error.response.data === 'string') {
                dataStr = error.response.data
            } else if (typeof error.response.data === 'object') {
                dataStr = JSON.stringify(error.response.data)
            }

            // Check for the exact title tags injected by Cloudflare's challenge firewall
            const isCfTitle =
                dataStr.includes('<title>Just a moment...</title>') ||
                dataStr.includes('<title>Attention Required!')

            if (isCfTitle) {
                isCfBlock = true
            } else {
                logger.warn(
                    `API returned ${error.response.status}, but it was a server error, NOT Cloudflare.`
                )
            }
        }

        // Check the boolean we injected directly into the config by our plugin manager to confirm if this request is from a CF-protected plugin
        if (isCfBlock && error.config && error.config.__cfProtected) {
            const pluginId = error.config.__pluginId

            // error.config.url might be a relative path, so we safely parse it using baseURL
            const targetUrl = new URL(error.config.url, error.config.baseURL)
            const baseUrl = targetUrl.origin
            const hostname = targetUrl.hostname

            logger.warn(
                `Cloudflare block detected for [${pluginId}] at ${baseUrl}. Attempting auto-solve...`
            )

            // If no hidden window is currently solving CF for this specific domain, start one
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

import { BrowserWindow } from 'electron'
import { createModuleLogger } from '@logger'

const logger = createModuleLogger('Scraper')

//? Use standard browser User-Agent so Cloudflare doesn't immediately flag Electron
export const SCRAPER_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export function createScraper(signal, cookieJar) {
    return {
        solve: async ({ url, interceptPattern, executeJs, waitForCf }) => {
            logger.info(`Starting scraper for URL: ${url}`)

            let win = new BrowserWindow({
                show: false,
                webPreferences: { offscreen: true }
            })

            return new Promise((resolve, reject) => {
                const cleanup = () => {
                    if (win && !win.isDestroyed()) {
                        if (win.webContents && !win.webContents.isDestroyed()) {
                            win.webContents.session.webRequest.onBeforeRequest(null)
                        }
                        win.destroy()
                        logger.debug('Scraper window destroyed and cleaned up.')
                    }
                    win = null //! Always nullify to prevent memory leaks
                }

                // Respect the IPC Timeout AbortSignal
                if (signal) {
                    signal.addEventListener('abort', () => {
                        logger.warn(`Scraper aborted via signal for URL: ${url}`)
                        cleanup()
                        reject(new Error('Scraper aborted due to timeout or cancellation'))
                    })
                }

                // Intercept a requested URL pattern if provided (used for dynamic token extraction in some plugins)
                if (interceptPattern) {
                    logger.info(`Setting up intercept pattern: ${interceptPattern}`)
                    win.webContents.session.webRequest.onBeforeRequest(
                        { urls: [interceptPattern] },
                        (details, callback) => {
                            logger.info(`Intercepted matching URL: ${details.url}`)
                            callback({ cancel: true }) //! Prevent actual loading to save bandwidth
                            cleanup()
                            resolve({ interceptedUrl: details.url })
                        }
                    )
                }

                // Load the target URL
                win.loadURL(url, { userAgent: SCRAPER_USER_AGENT }).catch((err) => {
                    logger.error(`Failed to load URL in scraper: ${url}`, err)
                    cleanup()
                    reject(err)
                })

                // When the DOM finishes loading
                win.webContents.on('did-finish-load', async () => {
                    // Inject and execute custom JS if the plugin provided it
                    if (executeJs) {
                        try {
                            logger.debug('Executing custom JavaScript in scraper.')
                            await win.webContents.executeJavaScript(executeJs)
                        } catch (err) {
                            logger.error('Failed to execute custom JS in scraper', err)
                        }
                    }

                    // If the plugin is waiting for a Cloudflare challenge to be solved, we repeatedly check the page title for signs of success.
                    if (waitForCf) {
                        try {
                            const title = await win.webContents.executeJavaScript('document.title')

                            // If the page title implies we passed the CF challenge
                            if (
                                !title.includes('Just a moment') &&
                                !title.includes('Attention Required')
                            ) {
                                const targetUrl = new URL(url)

                                // Grab all cookies for this domain from Electron's session
                                const cookies = await win.webContents.session.cookies.get({
                                    domain: targetUrl.hostname
                                })

                                // Serialize and save them to our global Node.js cookie jar
                                cookieJar[targetUrl.hostname] = cookies
                                    .map((c) => `${c.name}=${c.value}`)
                                    .join('; ')

                                logger.info(
                                    `Successfully stored Cloudflare cookies for ${targetUrl.hostname}`
                                )
                                cleanup()
                                resolve(true)
                            } else {
                                logger.debug(`Still waiting on Cloudflare challenge for ${url}...`)
                            }
                        } catch (err) {
                            logger.error('Error checking Cloudflare status in scraper', err)
                        }
                    } else if (!interceptPattern) {
                        // If we aren't waiting for CF and aren't intercepting, resolve immediately
                        cleanup()
                        resolve(true)
                    }
                })
            })
        }
    }
}

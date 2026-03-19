import { protocol } from 'electron'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { createModuleLogger } from '@logger'
import { getPlugin } from '@pluginSystem'
import noCoverPath from '@assets/no_cover.svg?asset'
const logger = createModuleLogger('Protocols')

const noCover = fs.readFileSync(noCoverPath)

export function setupTransekiProtocol() {
    logger.info('Setting up transeki:// protocol handler')

    protocol.handle('transeki', async (req) => {
        try {
            const url = new URL(req.url)
            const route = url.hostname // The first segment after transeki:// is treated as the route
            const targetURL = url.searchParams.get('url') // The original URL is passed as a query parameter
            const pluginId = url.searchParams.get('plugin') // Optional plugin ID for context
            logger.debug(`Received transeki:// request for route: ${route}, target: ${targetURL}`)

            if (!targetURL) {
                throw new Error('Missing target URL')
            }

            switch (route) {
                case 'icon':
                    return handleLocalIcon(targetURL)
                case 'proxy':
                    return await handleProxyRequest(targetURL, pluginId)
                default:
                    throw new Error(`Unknown route ${route}`)
            }
        } catch (error) {
            logger.error(`Transeki protocol error for "${req.url}": ${error.message}`)
            return new Response(noCover, {
                status: 404,
                headers: { 'Content-Type': 'image/svg+xml' }
            })
        }
    })
    logger.info('transeki:// protocol handler registered successfully')
}

function handleLocalIcon(targetUrl) {
    if (targetUrl === 'default_cover') {
        return new Response(noCover, {
            headers: { 'Content-Type': 'image/svg+xml' }
        })
    } else if (targetUrl.startsWith('file://')) {
        // Convert file:///C:/... to a proper Windows path
        const filePath = fileURLToPath(targetUrl)
        const fileData = fs.readFileSync(filePath)

        // Guess mime type so SVGs render correctly
        const ext = path.extname(filePath).toLowerCase()
        const mimeTypes = {
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp'
        }
        const contentType = mimeTypes[ext] || 'image/png'

        return new Response(fileData, {
            headers: { 'Content-Type': contentType }
        })
    } else {
        throw new Error(`Invalid local icon URL: ${targetUrl}`)
    }
}

async function handleProxyRequest(targetUrl, pluginId) {
    if (targetUrl.startsWith('http')) {
        let additionalHeaders = {}
        if (pluginId) {
            const plugin = getPlugin(pluginId)
            if (plugin && plugin.info.name) {
                logger.debug(`Proxying request for plugin [${plugin.info.name}] to ${targetUrl}`)
                additionalHeaders = plugin.info.requestHeaders
            } else {
                logger.warn(
                    `Plugin with ID ${pluginId} not found for proxy request to ${targetUrl}`
                )
            }
        }
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                ...additionalHeaders
            }
        })

        return new Response(response.data, {
            // Dynamically use the header MangaDex sends us
            headers: { 'Content-Type': response.headers['content-type'] }
        })
    } else {
        throw new Error(`Invalid proxy URL: ${targetUrl}`)
    }
}

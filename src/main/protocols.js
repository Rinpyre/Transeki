import { protocol } from 'electron'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import { pluginAxios } from './pluginSystem/customAxios.js'
import { SCRAPER_USER_AGENT } from './pluginSystem/scraper.js'
import { createModuleLogger } from '@logger'
import noCoverPath from '@assets/no_cover.svg?asset'
const logger = createModuleLogger('Protocols')

export function setupTransekiProtocol() {
    logger.info('Setting up transeki:// protocol handler')

    protocol.handle('transeki', async (req) => {
        try {
            const url = new URL(req.url)
            const route = url.hostname // The first segment after transeki:// is treated as the route

            logger.debug(`Received transeki:// request for route: ${route}`)

            switch (route) {
                case 'icon':
                    return handleLocalIcon(url)
                case 'proxy':
                    return await handleProxyRequest(url)
                default:
                    throw new Error(`Unknown route ${route}`)
            }
        } catch (error) {
            logger.error(`Transeki protocol error for "${req.url}": ${error.message}`)
            return new Response(`Error: ${error.message}`, { status: 500 })
        }
    })
    logger.info('transeki:// protocol handler registered successfully')
}

function handleLocalIcon(url) {
    const targetPath = url.searchParams.get('path')

    // "No cover" fallback
    if (targetPath === 'default_cover') {
        const fileData = fs.readFileSync(noCoverPath)
        return new Response(fileData, {
            headers: { 'Content-Type': 'image/svg+xml' }
        })
    }

    // Plusin icons from the hard drive
    if (targetPath.startsWith('file://')) {
        // Convert file:///C:/... to a proper Windows path
        const filePath = fileURLToPath(targetPath)
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
        throw new Error(`Invalid local icon path: ${targetPath}`)
    }
}

async function handleProxyRequest(url) {
    // The URL looks like: transeki://proxy/eyJ1cmwiOi... (Base64 payload)
    const base64Data = url.pathname.substring(1) // Remove the leading '/'
    const params = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'))

    if (!params.url || !params.pluginId) {
        return handleLocalIcon(new URL(`transeki://icon?path=default_cover`)) // Return default cover on error
    }

    const headers = {}
    if (params.referer) headers['Referer'] = params.referer
    if (params.useUserAgent) headers['User-Agent'] = SCRAPER_USER_AGENT

    // Let pluginAxios handle the Cloudflare magic and cookies!
    try {
        const response = await pluginAxios.get(params.url, {
            responseType: 'arraybuffer',
            headers,
            __pluginId: params.pluginId,
            __cfProtected: params.useCf
        })

        return new Response(response.data, {
            headers: { 'Content-Type': response.headers['content-type'] }
        })
    } catch (error) {
        logger.error(`Failed to fetch proxied image [${params.url}]: ${error.message}`)

        // Instead of breaking the React UI, return the safe fallback SVG!
        return handleLocalIcon(new URL(`transeki://icon?path=default_cover`))
    }
}

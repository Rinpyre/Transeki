import { ipcMain } from 'electron'
import { getAppDataPath, getFolderPath } from '@appData'
import { getAllPlugins, getPlugin, createPluginModules } from '@pluginSystem'
import { createModuleLogger } from '@logger'

const logger = createModuleLogger('IPC Handlers')

const PLUGIN_TIMEOUT_MS = 10_000

function serializePlugin(plugin) {
    return {
        id: plugin.info.id,
        name: plugin.info.name,
        sourceUrl: plugin.info.sourceUrl,
        version: plugin.info.version,
        description: plugin.info.description,
        author: plugin.info.author,
        icon: plugin.icon,
        actions: Object.keys(plugin.actions).filter(
            (key) => typeof plugin.actions[key] === 'function'
        )
    }
}

async function runPluginAction(pluginId, actionFn) {
    const plugin = getPlugin(pluginId)
    if (!plugin) throw new Error(`Plugin not found: ${pluginId}`)

    const controller = new AbortController()
    let timeoutId

    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            controller.abort() // Cancel any in-flight network requests
            reject(new Error('Plugin action timed out'))
        }, PLUGIN_TIMEOUT_MS)
    })

    try {
        // Promise.race: if actionFn wins, finally runs clearTimeout before the timer ever fires.
        // If timeout wins, the abort signal has already been sent to cancel network requests.
        return await Promise.race([
            actionFn(plugin, createPluginModules(controller.signal)),
            timeoutPromise
        ])
    } catch (err) {
        // Axios cancellations surface as AbortError — normalize the message
        if (err.name === 'AbortError') throw new Error('Plugin action timed out')
        throw err
    } finally {
        // Always clean up: prevents the timeout from firing if the action won the race
        clearTimeout(timeoutId)
    }
}

export function registerIpcHandlers() {
    // IPC test
    ipcMain.on('ping', () => logger.info('!Pong! Received ping from renderer!'))

    // AppData IPC handlers
    ipcMain.handle('get-appdata-path', () => getAppDataPath())
    ipcMain.handle('get-folder-path', (_, folderName) => getFolderPath(folderName))

    // Plugin info IPC handlers
    ipcMain.handle('plugins:get-all', () => getAllPlugins().map(serializePlugin))
    ipcMain.handle('plugins:get-by-id', (_, id) => {
        const plugin = getPlugin(id)
        return plugin ? serializePlugin(plugin) : null
    })

    // Plugin action IPC handlers
    ipcMain.handle('plugin:search', async (_, pluginId, query) => {
        try {
            return await runPluginAction(pluginId, (plugin, modules) =>
                plugin.actions.search(query, modules)
            )
        } catch (err) {
            return { __ipcError: true, message: err.message || 'Failed to search' }
        }
    })

    ipcMain.handle('plugin:get-manga', async (_, pluginId, mangaId) => {
        try {
            return await runPluginAction(pluginId, (plugin, modules) =>
                plugin.actions.getManga(mangaId, modules)
            )
        } catch (err) {
            return { __ipcError: true, message: err.message || 'Failed to get manga' }
        }
    })

    ipcMain.handle('plugin:get-chapter', async (_, pluginId, mangaId, chapterId) => {
        try {
            return await runPluginAction(pluginId, (plugin, modules) =>
                plugin.actions.getChapter(mangaId, chapterId, modules)
            )
        } catch (err) {
            return { __ipcError: true, message: err.message || 'Failed to get chapter' }
        }
    })

    ipcMain.handle('window-control:is-maximized', (event) => {
        const window = event.sender.getOwnerBrowserWindow()
        return window ? window.isMaximized() : false
    })

    // Window control handlers
    ipcMain.on('window-control:minimize', (event) => {
        const window = event.sender.getOwnerBrowserWindow()
        if (window) window.minimize()
    })

    ipcMain.on('window-control:maximize', (event) => {
        const window = event.sender.getOwnerBrowserWindow()
        if (window) window.maximize()
    })

    ipcMain.on('window-control:restore', (event) => {
        const window = event.sender.getOwnerBrowserWindow()
        if (window) window.restore()
    })

    ipcMain.on('window-control:close', (event) => {
        const window = event.sender.getOwnerBrowserWindow()
        if (window) window.close()
    })
}

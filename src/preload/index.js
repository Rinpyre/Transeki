import { contextBridge, ipcRenderer } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', {
            ipc: {
                send: (channel, ...args) => ipcRenderer.send(channel, ...args),
                on: (channel, func) => {
                    const subscription = (_event, ...args) => func(...args)
                    ipcRenderer.on(channel, subscription)
                    return () => ipcRenderer.removeListener(channel, subscription)
                },
                once: (channel, func) => {
                    ipcRenderer.once(channel, (_event, ...args) => func(...args))
                },
                invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
            }
        })
        contextBridge.exposeInMainWorld('appData', {
            getAppDataPath: () => ipcRenderer.invoke('get-appdata-path'),
            getFolderPath: (folderName) => ipcRenderer.invoke('get-folder-path', folderName)
        })
        contextBridge.exposeInMainWorld('plugins', {
            getPlugins: () => ipcRenderer.invoke('plugins:get-all'),
            getPlugin: (id) => ipcRenderer.invoke('plugins:get-by-id', id),
            search: async (pluginId, query) => {
                const res = await ipcRenderer.invoke('plugin:search', pluginId, query)
                if (res && res.__ipcError) throw new Error(res.message)
                return res
            },
            getManga: async (pluginId, mangaId) => {
                const res = await ipcRenderer.invoke('plugin:get-manga', pluginId, mangaId)
                if (res && res.__ipcError) throw new Error(res.message)
                return res
            },
            getChapter: async (pluginId, mangaId, chapterId) => {
                const res = await ipcRenderer.invoke(
                    'plugin:get-chapter',
                    pluginId,
                    mangaId,
                    chapterId
                )
                if (res && res.__ipcError) throw new Error(res.message)
                return res
            }
        })
        contextBridge.exposeInMainWorld('env', {
            isDev: process.env.NODE_ENV === 'development',
            isProd: process.env.NODE_ENV === 'production',
            platform: process.platform,
            versions: process.versions
        })
        contextBridge.exposeInMainWorld('windowControls', {
            minimize: () => ipcRenderer.send('window-control:minimize'),
            maximize: () => ipcRenderer.send('window-control:maximize'),
            restore: () => ipcRenderer.send('window-control:restore'),
            close: () => ipcRenderer.send('window-control:close'),
            isMaximized: () => ipcRenderer.invoke('window-control:is-maximized'),
            onMaximize: (func) => {
                const subscription = () => func()
                ipcRenderer.on('window-control:maximized', subscription)
                return () => ipcRenderer.removeListener('window-control:maximized', subscription)
            },
            onRestore: (func) => {
                const subscription = () => func()
                ipcRenderer.on('window-control:restored', subscription)
                return () => ipcRenderer.removeListener('window-control:restored', subscription)
            }
        })
    } catch (error) {
        console.error(error)
    }
}

//! Fallback for non-isolated contexts is not recommended and will NOT be used despite being helpful for debugging, so we won't implement it. If context isolation is disabled, the preload script will simply do nothing and the renderer will have no access to Electron APIs, which is safer than exposing them unsafely.

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
        contextBridge.exposeInMainWorld('env', {
            isDev: process.env.NODE_ENV === 'development',
            isProd: process.env.NODE_ENV === 'production',
            platform: process.platform,
            versions: process.versions
        })
    } catch (error) {
        console.error(error)
    }
}

// Fallback for non-isolated contexts is not recommended and will NOT be used despite being helpful for debugging, so we won't implement it. If context isolation is disabled, the preload script will simply do nothing and the renderer will have no access to Electron APIs, which is safer than exposing them unsafely.

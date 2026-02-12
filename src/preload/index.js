import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', {
            ipcRenderer: {
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
            },
            appData: {
                getAppDataPath: () => ipcRenderer.invoke('get-appdata-path'),
                getFolderPath: (folderName) => ipcRenderer.invoke('get-folder-path', folderName)
            },
            process: {
                // Manually expose only safe version strings, not the whole process object
                versions: process.versions
            }
        })
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // Fallback for non-isolated contexts (not recommended but good for debugging)
    window.electron = {
        ipcRenderer: {
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
        },
        appData: {
            getAppDataPath: () => ipcRenderer.invoke('get-appdata-path'),
            getFolderPath: (folderName) => ipcRenderer.invoke('get-folder-path', folderName)
        },
        process: {
            versions: process.versions
        }
    }
    window.api = api
}

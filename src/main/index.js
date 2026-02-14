import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
import { initializeAppData, getAppDataPath, getFolderPath } from './appDataManager.js'
import { initializePluginsFolder, loadPlugins } from './pluginManager.js'
import { createModuleLogger } from './logger.js'

const logger = createModuleLogger('Main')

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1684, // +16px
        height: 851, // +39px
        show: false,
        icon: icon,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.cjs'),
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.rinpyre.transeki')

    // Completely disable the application menu
    Menu.setApplicationMenu(null)

    // Initialize appdata directory structure
    await initializeAppData().catch((error) => {
        console.error('Failed to initialize appdata:', error)
    })

    // Now logger can safely write to files
    logger.info('Application started successfully')
    logger.info('AppData initialization complete')

    // Load plugins
    // We don't await this because we want the app to load as fast as possible and plugins can be loaded in the background
    initializePluginsFolder()
        .then(() => loadPlugins())
        .then((plugins) => {
            logger.info(`Successfully loaded ${plugins.length} plugins!`)
            if (plugins.length > 0 && process.env.NODE_ENV === 'development') {
                logger.debug('Loaded plugins:', { plugins: plugins.map((p) => p.info.name) })
            }
        })
        .catch((error) => {
            logger.error('Failed to load plugins:', error)
        })

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    // AppData IPC handlers
    ipcMain.handle('get-appdata-path', () => getAppDataPath())
    ipcMain.handle('get-folder-path', (_, folderName) => getFolderPath(folderName))

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

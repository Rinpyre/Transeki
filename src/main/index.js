import { app, shell, BrowserWindow, Menu, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
import { initializeAppData } from '@appData'
import { initializePluginsFolder, loadPlugins } from '@pluginSystem'
import { createModuleLogger } from '@logger'
import { registerIpcHandlers } from './ipcHandlers.js'
import { setupTransekiProtocol } from './protocols.js'

const logger = createModuleLogger('Main')

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'transeki',
        privileges: {
            bypassCSP: true,
            standard: true,
            secure: true,
            supportFetchAPI: true
        }
    }
])

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1684, // +16px
        height: 851, // +39px
        show: false,
        icon: icon,
        ...(process.platform === 'linux' ? { icon } : {}),
        ...(process.platform === 'win32' ? { frame: false } : {}),
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

    mainWindow.on('maximize', () => {
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('window-control:maximized')
        }
    })

    mainWindow.on('unmaximize', () => {
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('window-control:restored')
        }
    })

    // Open external links in default browser
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
    // This is required for notifications and some other features to work correctly on Windows
    electronApp.setAppUserModelId('com.rinpyre.transeki')

    // Completely disable the application menu
    Menu.setApplicationMenu(null)

    // Initialize appdata directory structure
    await initializeAppData().catch((error) => {
        console.error('Failed to initialize appdata:', error)
    })

    // Log app startup, which will also initialize the logger and create the log file for this session
    logger.info('Application started successfully')
    logger.info('AppData initialization complete')

    // Load plugins
    // We await this because we want the app to have the plugins ready to use.
    await initializePluginsFolder()
        .then(() => loadPlugins())
        .then((plugins) => {
            logger.info(
                `Successfully loaded ${plugins.length} plugin${plugins.length !== 1 ? 's' : ''}!`
            )
            if (plugins.length > 0 && process.env.NODE_ENV === 'development') {
                logger.debug(
                    'Loaded plugins:',
                    plugins.map((p) => p.info.name)
                )
            }
        })
        .catch((error) => {
            logger.error('Failed to load plugins:', error)
        })

    // Setup custom protocols
    setupTransekiProtocol()

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // Call other setup functions
    registerIpcHandlers()
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

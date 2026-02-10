import { app } from 'electron'
import { join } from 'path'
import { mkdir } from 'fs/promises'

// Configurable root folder name within Electron's userData directory
// Can be changed to customize where app data is stored
const APP_DATA_FOLDER_NAME = 'userData'

// Subfolder structure constants
const FOLDERS = {
    DB: 'db',
    CONFIG: 'config',
    SETTINGS: 'settings',
    EXTENSIONS: 'extensions'
}

/**
 * Get the root appdata directory path
 * Uses Electron's app.getPath('userData') as base, then appends configurable APP_DATA_FOLDER_NAME
 * Platform-specific base paths:
 * - Windows: %APPDATA%\Transeki\userData
 * - macOS: ~/Library/Application Support/Transeki/userData
 * - Linux: ~/.config/Transeki/userData
 */
function getAppDataPath() {
    const baseUserDataPath = app.getPath('userData')
    return join(baseUserDataPath, APP_DATA_FOLDER_NAME)
}

/**
 * Get a specific folder path within the appdata directory
 * @param {string} folderName - One of: 'db', 'config', 'settings', 'extensions'
 * @returns {string} Full path to the requested folder
 */
function getFolderPath(folderName) {
    const rootPath = getAppDataPath()
    const validFolders = Object.values(FOLDERS)

    if (!validFolders.includes(folderName)) {
        throw new Error(
            `Invalid folder name: ${folderName}. Valid options: ${validFolders.join(', ')}`
        )
    }

    return join(rootPath, folderName)
}

/**
 * Initialize the appdata directory structure
 * Creates all required folders if they don't exist
 * Silently succeeds if folders already exist (idempotent)
 * @returns {Promise<void>}
 */
async function initializeAppData() {
    try {
        const rootPath = getAppDataPath()

        // Create root appdata directory
        await mkdir(rootPath, { recursive: true })

        // Create all required subdirectories
        for (const folder of Object.values(FOLDERS)) {
            const folderPath = join(rootPath, folder)
            await mkdir(folderPath, { recursive: true })
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AppData] Initialized at: ${rootPath}`)
        }
    } catch (error) {
        console.error('[AppData] Initialization failed:', error.message)
        throw error
    }
}

export { getAppDataPath, getFolderPath, initializeAppData, FOLDERS, APP_DATA_FOLDER_NAME }

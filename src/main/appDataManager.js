import { app } from 'electron'
import { join } from 'path'
import { mkdir, stat } from 'fs/promises'

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
        let rootExists = false

        // Check if root appdata directory exists
        try {
            await stat(rootPath)
            rootExists = true
        } catch {
            // Directory doesn't exist, will be created
            rootExists = false
        }

        // Create root appdata directory if it doesn't exist
        if (!rootExists) {
            await mkdir(rootPath, { recursive: true })
            if (process.env.NODE_ENV === 'development') {
                console.log(`[AppData] Created root directory at: ${rootPath}`)
            }
        } else if (process.env.NODE_ENV === 'development') {
            console.log(`[AppData] Root directory already exists at: ${rootPath}`)
        }

        // Create all required subdirectories
        for (const folder of Object.values(FOLDERS)) {
            const folderPath = join(rootPath, folder)
            let folderExists = false

            // Check if folder exists
            try {
                await stat(folderPath)
                folderExists = true
            } catch {
                // Folder doesn't exist, will be created
                folderExists = false
            }

            if (!folderExists) {
                await mkdir(folderPath, { recursive: true })
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[AppData]   Created subfolder: ${folder}`)
                }
            } else if (process.env.NODE_ENV === 'development') {
                console.log(`[AppData]   Skipped existing subfolder: ${folder}`)
            }
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AppData] Initialization complete`)
        }
    } catch (error) {
        console.error('[AppData] Initialization failed:', error.message)
        throw error
    }
}

export { getAppDataPath, getFolderPath, initializeAppData, FOLDERS, APP_DATA_FOLDER_NAME }

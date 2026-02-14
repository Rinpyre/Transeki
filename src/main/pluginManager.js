import { getFolderPath } from './appDataManager'
import { join } from 'path'
import { mkdir, stat, readdir } from 'fs/promises'
import { readFileSync } from 'fs'

const manifestFileNames = ['manifest.json', 'meta.json', 'metadata.json']
const mainFileNames = ['index.js', 'main.js']

function isValidPluginDirectoryName(name) {
    // Reject if contains path separators or navigation
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
        return false
    }

    // Reject if starts with dot (hidden files/folders)
    if (name.startsWith('.')) {
        return false
    }

    // Reject if contains suspicious characters
    const suspiciousChars = ['<', '>', ':', '"', '|', '?', '*']
    if (suspiciousChars.some((char) => name.includes(char))) {
        return false
    }

    // Must have at least one character
    if (name.trim().length === 0) {
        return false
    }

    return true
}

function createPlugin(data) {
    return {
        info: data.info || null,
        icon: data.icon || null,
        actions: {
            search: data.actions?.search || null,
            getManga: data.actions?.getManga || null,
            getChapter: data.actions?.getChapter || null
        }
    }
}

function getPluginsFolderPath() {
    return getFolderPath('plugins')
}

async function initializePluginsFolder() {
    const pluginsPath = getPluginsFolderPath()
    console.log(`[Plugins] Checking plugins folder at: ${pluginsPath}`)

    try {
        await stat(pluginsPath)
        console.log(`[Plugins] Plugins folder found!`)
    } catch {
        console.warn(`[Plugins] Plugins folder not found! Attempting to create it...`)
        try {
            await mkdir(pluginsPath, { recursive: true })
            console.log(`[Plugins]  Created plugins folder.`)
        } catch (mkdirError) {
            console.error(`[Plugins] Failed to create plugins folder!`, mkdirError)
            return
        }
    }
}

async function discoverPluginDirectories() {
    const pluginsPath = getPluginsFolderPath()
    console.log(`[Plugins] Reading directory: ${pluginsPath}`)

    const directories = await readdir(pluginsPath, { withFileTypes: true })
        .then((files) => files.filter((file) => file.isDirectory()))
        .catch((error) => {
            console.error(`[Plugins] Failed to read plugins directory!`, error)
            return []
        })

    if (directories.length === 0) {
        console.log(`[Plugins] No plugins found in the plugins folder.`)
        return []
    }

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Plugins] Found ${directories.length} possible plugins:`, directories)
    } else {
        console.log(`[Plugins] Found ${directories.length} possible plugins.`)
    }

    return directories
}

function findPluginFiles(pluginFiles) {
    const manifestFile = manifestFileNames.find((manifestFileName) =>
        pluginFiles.some((file) => file.isFile() && file.name === manifestFileName)
    )

    const mainFile = mainFileNames.find((mainFileName) =>
        pluginFiles.some((file) => file.isFile() && file.name === mainFileName)
    )

    const iconFile = pluginFiles.find(
        (file) =>
            file.isFile() &&
            file.name.toLowerCase().startsWith('icon') &&
            ['.png', '.jpg', '.jpeg', '.svg', '.webp'].some((ext) =>
                file.name.toLowerCase().endsWith(ext)
            )
    )

    return { manifestFile, mainFile, iconFile }
}

async function loadPluginContent(pluginPath, pluginName, { manifestFile, mainFile }) {
    let manifestContent = null
    let mainFileContent = null

    // Load manifest content
    if (manifestFile) {
        try {
            const manifestPath = join(pluginPath, manifestFile)
            manifestContent = JSON.parse(readFileSync(manifestPath, 'utf-8'))
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    `[Plugins]   Successfully loaded manifest content for '${pluginName}':`,
                    manifestContent
                )
            } else {
                console.log(`[Plugins]   Successfully loaded manifest content for '${pluginName}'.`)
            }
        } catch (error) {
            console.error(`[Plugins]   Failed to load manifest content for '${pluginName}'!`, error)
        }
    }

    // Load main file content
    if (mainFile) {
        try {
            const mainFilePath = join(pluginPath, mainFile)
            // On Windows, convert the path to a file URL to import it correctly, especially if it contains spaces
            const importPath =
                process.platform === 'win32' ? `file://${mainFilePath}` : mainFilePath
            const mainFileRaw = await import(importPath)
            mainFileContent = mainFileRaw.default || mainFileRaw
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    `[Plugins]   Successfully loaded main file content for '${pluginName}':`,
                    mainFileContent
                )
            } else {
                console.log(
                    `[Plugins]   Successfully loaded main file content for '${pluginName}'.`
                )
            }
        } catch (error) {
            console.error(
                `[Plugins]   Failed to load main file content for '${pluginName}'!`,
                error
            )
        }
    }

    return { manifestContent, mainFileContent }
}

async function loadSinglePlugin(pluginDir, pluginsPath) {
    const pluginName = pluginDir.name

    // Validate plugin directory name for security
    if (!isValidPluginDirectoryName(pluginName)) {
        console.warn(`[Plugins] Skipping '${pluginName}' - invalid directory name (security risk)`)
        return null
    }

    const pluginPath = join(pluginsPath, pluginName)
    console.log(`[Plugins]   Checking '${pluginName}' directory...`)

    const pluginFiles = await readdir(pluginPath, { withFileTypes: true })
    const { manifestFile, mainFile, iconFile } = findPluginFiles(pluginFiles)

    // Log found files
    if (!manifestFile) {
        console.warn(`[Plugins]   No manifest found in '${pluginName}'.`)
    } else {
        console.log(`[Plugins]   Found manifest '${manifestFile}' in '${pluginName}'`)
    }

    if (!mainFile) {
        console.warn(`[Plugins]   No main file found in '${pluginName}'.`)
    } else {
        console.log(`[Plugins]   Found main file '${mainFile}' in '${pluginName}'`)
    }

    if (iconFile) {
        console.log(`[Plugins]   Found icon file '${iconFile.name}' in '${pluginName}'`)
    } else {
        console.log(`[Plugins]   No icon file found in '${pluginName}' (optional).`)
    }

    // Validate required files
    if (!manifestFile || !mainFile) {
        console.warn(
            `[Plugins] Folder '${pluginName}' is missing required files and will be skipped.`
        )
        return null
    }

    // Load file contents
    const { manifestContent, mainFileContent } = await loadPluginContent(pluginPath, pluginName, {
        manifestFile,
        mainFile
    })

    // Create plugin object
    console.log(`[Plugins] Folder '${pluginName}' is a valid plugin!`)
    const iconPath = iconFile ? `file://${join(pluginPath, iconFile.name)}` : null
    const plugin = createPlugin({
        info: manifestContent,
        icon: iconPath,
        actions: mainFileContent
    })

    console.log(`[Plugins] Loaded plugin '${pluginName}':`, plugin)
    return plugin
}

async function loadPlugins() {
    console.log('[Plugins] Loading plugins...')

    const possiblePlugins = await discoverPluginDirectories()
    if (possiblePlugins.length === 0) {
        return []
    }

    const pluginsPath = getPluginsFolderPath()
    console.log(`[Plugins] Starting to check plugins...`)

    const loadedPlugins = []
    for (const pluginDir of possiblePlugins) {
        const plugin = await loadSinglePlugin(pluginDir, pluginsPath)
        if (plugin) {
            loadedPlugins.push(plugin)
        }
    }

    console.log(`[Plugins] Loaded ${loadedPlugins.length} plugins.`)
    if (loadedPlugins.length < possiblePlugins.length) {
        console.warn(
            `[Plugins] There have been discovered other ${possiblePlugins.length - loadedPlugins.length} folders that were not valid plugins!`
        )
    }

    return loadedPlugins
}

export { getPluginsFolderPath, initializePluginsFolder, loadPlugins }

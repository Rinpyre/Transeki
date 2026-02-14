import { getFolderPath } from './appDataManager'
import { createModuleLogger } from './logger'
import { join } from 'path'
import { mkdir, stat, readdir } from 'fs/promises'
import { readFileSync } from 'fs'

const logger = createModuleLogger('Plugins')

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
    logger.info(`Checking plugins folder at: ${pluginsPath}`)

    try {
        await stat(pluginsPath)
        logger.info(`Plugins folder found!`)
    } catch {
        logger.warn(`Plugins folder not found! Attempting to create it...`)
        try {
            await mkdir(pluginsPath, { recursive: true })
            logger.info(`Created plugins folder.`)
        } catch (mkdirError) {
            logger.error(`Failed to create plugins folder!`, mkdirError)
            return
        }
    }
}

async function discoverPluginDirectories() {
    const pluginsPath = getPluginsFolderPath()

    const directories = await readdir(pluginsPath, { withFileTypes: true })
        .then((files) => files.filter((file) => file.isDirectory()))
        .catch((error) => {
            logger.error(`Failed to read plugins directory: ${error.message}`)
            return []
        })

    if (directories.length === 0) {
        logger.info(`No plugin directories found.`)
        return []
    }

    logger.info(
        `Found ${directories.length} possible plugin${directories.length === 1 ? '' : 's'}.`
    )
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
    let manifestError = null
    let mainFileError = null

    // Load manifest content
    if (manifestFile) {
        try {
            const manifestPath = join(pluginPath, manifestFile)
            manifestContent = JSON.parse(readFileSync(manifestPath, 'utf-8'))
        } catch (error) {
            manifestError = error.message
            logger.error(`Failed to load manifest for '${pluginName}': ${error.message}`)
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
        } catch (error) {
            mainFileError = error.message
            logger.error(`Failed to load main file for '${pluginName}': ${error.message}`)
        }
    }

    return {
        manifestContent,
        mainFileContent,
        success: manifestContent !== null && mainFileContent !== null,
        error: manifestError || mainFileError
    }
}

async function loadSinglePlugin(pluginDir, pluginsPath) {
    const pluginName = pluginDir.name

    // Validate plugin directory name for security
    if (!isValidPluginDirectoryName(pluginName)) {
        return { plugin: null, reason: 'Invalid directory name (security risk)' }
    }

    const pluginPath = join(pluginsPath, pluginName)

    // Read plugin directory with error handling
    let pluginFiles
    try {
        pluginFiles = await readdir(pluginPath, { withFileTypes: true })
    } catch (error) {
        logger.error(`Failed to read directory '${pluginName}': ${error.message}`)
        return { plugin: null, reason: `Cannot read directory: ${error.message}` }
    }

    const { manifestFile, mainFile, iconFile } = findPluginFiles(pluginFiles)

    // Validate required files
    if (!manifestFile) {
        return { plugin: null, reason: 'Missing manifest file' }
    }
    if (!mainFile) {
        return { plugin: null, reason: 'Missing main file' }
    }

    // Development-only detailed logging
    if (process.env.NODE_ENV === 'development') {
        logger.debug(
            `'${pluginName}': manifest=${manifestFile}, main=${mainFile}, icon=${iconFile?.name || 'none'}`
        )
    }

    // Load file contents
    const loadResult = await loadPluginContent(pluginPath, pluginName, {
        manifestFile,
        mainFile
    })

    if (!loadResult.success) {
        return { plugin: null, reason: loadResult.error || 'Failed to load content' }
    }

    // Create plugin object
    const iconPath = iconFile ? `file://${join(pluginPath, iconFile.name)}` : null
    const plugin = createPlugin({
        info: loadResult.manifestContent,
        icon: iconPath,
        actions: loadResult.mainFileContent
    })

    return { plugin, reason: null }
}

async function loadPlugins() {
    logger.info('Loading plugins...')

    const possiblePlugins = await discoverPluginDirectories()
    if (possiblePlugins.length === 0) {
        return []
    }

    const pluginsPath = getPluginsFolderPath()
    const loadedPlugins = []
    const failures = []

    for (const pluginDir of possiblePlugins) {
        const { plugin, reason } = await loadSinglePlugin(pluginDir, pluginsPath)
        if (plugin) {
            loadedPlugins.push(plugin)
            logger.info(`[OK] Loaded '${pluginDir.name}'`)
        } else {
            failures.push({ name: pluginDir.name, reason })
            logger.warn(`[X] Failed '${pluginDir.name}': ${reason}`)
        }
    }

    // Summary
    logger.info(`Successfully loaded ${loadedPlugins.length}/${possiblePlugins.length} plugins.`)
    if (failures.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Failed plugins:', { failures })
    }

    return loadedPlugins
}

export { getPluginsFolderPath, initializePluginsFolder, loadPlugins }

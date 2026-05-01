import { getFolderPath } from '@appData'
import { createModuleLogger } from '@logger'
import { join } from 'path'
import { mkdir, stat, readdir, readFile } from 'fs/promises'
import {
    isValidPluginDirectoryName,
    validateManifest,
    validatePluginSource,
    validatePluginExports
} from '@pluginSystem'
import { pathToFileURL } from 'url'
import { pluginAxios, cookieJar } from './customAxios.js'
import { createScraper } from './scraper.js'
import * as cheerio from 'cheerio'

const logger = createModuleLogger('Plugins')

const CURRENT_API_VERSION = 1

const manifestFileNames = ['manifest.json', 'meta.json', 'metadata.json']
const mainFileNames = ['index.js', 'main.js']
const iconFileNames = ['icon.png']

const pluginRegistry = new Map()

// --- Plugin construction ---

function createPlugin(data) {
    return {
        info: data.info ?? null,
        icon: data.icon ?? null,
        actions: {
            search: data.actions?.search ?? null,
            getManga: data.actions?.getManga ?? null,
            getChapter: data.actions?.getChapter ?? null
        }
    }
}

// --- Module injection ---

// Plugin calling convention:
//   plugin.actions.search(query, modules)                    → modules: { axios, signal }
//   plugin.actions.getManga(id, modules)                     → modules: { axios, signal }
//   plugin.actions.getChapter(id, chapterNum, modules)       → modules: { axios, signal }
//
// `signal` is an AbortSignal — pass it to axios: axios.get(url, { signal })
// This enables true cancellation when a timeout fires or the user navigates away.
function createPluginModules(plugin, signal = null) {
    const pluginId = plugin.info.id

    // Helper to silently inject the plugin ID and AbortSignal into the axios config
    const injectConfig = (config = {}) => ({
        ...config,
        signal,
        __pluginId: pluginId,
        __cfProtected: plugin.info.cf_protected
    })

    // Pass a wrapped version of Axios so the plugin developer doesn't have
    // to worry about manually passing signals or plugin IDs.
    const axiosWrapper = {
        request: (config) => pluginAxios.request(injectConfig(config)),
        get: (url, config) => pluginAxios.get(url, injectConfig(config)),
        post: (url, data, config) => pluginAxios.post(url, data, injectConfig(config)),
        put: (url, data, config) => pluginAxios.put(url, data, injectConfig(config)),
        delete: (url, config) => pluginAxios.delete(url, injectConfig(config))
    }

    // Image proxy builder
    const proxyImage = (imageUrl, options = {}) => {
        //? Even if no security needed, proxying is done to solve no-cover issues
        const payload = JSON.stringify({
            url: imageUrl,
            referer: options.referer || null,
            useUserAgent: options.useUserAgent || false,
            useCf: options.useCf || false,
            pluginId: plugin.info.id //! Should never be null if useCf is true
        })

        return `transeki://proxy/${Buffer.from(payload).toString('base64')}`
    }

    const baseLogger = createModuleLogger(plugin.info.name || plugin.info.id)
    const pluginLogger = {
        info: (msg, ...args) => baseLogger.info(msg, ...args),
        warn: (msg, ...args) => baseLogger.warn(msg, ...args),
        error: (msg, ...args) => baseLogger.error(msg, ...args),
        debug: (msg, ...args) => baseLogger.debug(msg, ...args),

        //! If a dev accidentally types logger.log(), silently convert it to an info log so it doesn't crash Winston!
        log: (msg, ...args) => baseLogger.info(msg, ...args)
    }

    return {
        axios: axiosWrapper,
        signal,
        scraper: createScraper(signal, cookieJar),
        proxyImage,
        logger: pluginLogger,
        cheerio
    }
}

// --- Registry accessors ---

function getPlugin(id) {
    return pluginRegistry.get(id) ?? null
}

function getAllPlugins() {
    return Array.from(pluginRegistry.values())
}

function getPluginIds() {
    return Array.from(pluginRegistry.keys())
}

// --- Core loading ---

function getPluginsFolderPath() {
    const CUSTOM_PLUGIN_FOLDER_PATH = process.env.PLUGIN_FOLDER_PATH
    if (CUSTOM_PLUGIN_FOLDER_PATH) {
        logger.info(
            `Using custom plugin folder path from environment variable: ${CUSTOM_PLUGIN_FOLDER_PATH}`
        )
        return CUSTOM_PLUGIN_FOLDER_PATH
    }
    return getFolderPath('plugins')
}

async function initializePluginsFolder() {
    const pluginsPath = getPluginsFolderPath()
    logger.info(`Checking plugins folder at: ${pluginsPath}`)

    try {
        await stat(pluginsPath)
        logger.info('Plugins folder found!')
    } catch {
        logger.warn('Plugins folder not found! Attempting to create it...')
        try {
            await mkdir(pluginsPath, { recursive: true })
            logger.info('Created plugins folder.')
        } catch (mkdirError) {
            logger.error('Failed to create plugins folder!', mkdirError)
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
        logger.info('No plugin directories found.')
        return []
    }

    logger.info(
        `Found ${directories.length} possible plugin${directories.length === 1 ? '' : 's'}.`
    )
    return directories
}

async function loadSinglePlugin(pluginDir, pluginsPath) {
    const folderName = pluginDir.name

    if (!isValidPluginDirectoryName(folderName)) {
        return { plugin: null, reason: 'Invalid directory name (security risk)' }
    }

    const pluginPath = join(pluginsPath, folderName)

    let pluginFiles
    try {
        pluginFiles = await readdir(pluginPath, { withFileTypes: true })
    } catch (error) {
        return { plugin: null, reason: `Cannot read directory: ${error.message}` }
    }

    // Find manifest file by name list
    const manifestFileName = manifestFileNames.find((name) =>
        pluginFiles.some((f) => f.isFile() && f.name === name)
    )
    if (!manifestFileName) {
        return { plugin: null, reason: 'Missing manifest file' }
    }

    // Load and parse manifest
    let manifest
    try {
        manifest = JSON.parse(await readFile(join(pluginPath, manifestFileName), 'utf-8'))
    } catch (error) {
        return { plugin: null, reason: `Failed to parse manifest: ${error.message}` }
    }

    // Validate manifest schema
    const manifestValidation = validateManifest(manifest)
    if (!manifestValidation.valid) {
        return {
            plugin: null,
            reason: `Invalid manifest: ${manifestValidation.errors.join(', ')}`
        }
    }

    // Warn if plugin targets a different API version
    if (manifest.apiVersion !== CURRENT_API_VERSION) {
        logger.warn(
            `[API] '${manifest.id}' targets apiVersion ${manifest.apiVersion}, current is ${CURRENT_API_VERSION} - plugin may be incompatible`
        )
    }

    // Resolve main file (manifest.main takes priority, fallback to default list)
    const mainCandidates = manifest.main
        ? [manifest.main, ...mainFileNames.filter((n) => n !== manifest.main)]
        : mainFileNames
    const mainFileName = mainCandidates.find((name) =>
        pluginFiles.some((f) => f.isFile() && f.name === name)
    )
    if (!mainFileName) {
        return { plugin: null, reason: `Missing main file (tried: ${mainCandidates.join(', ')})` }
    }

    // Scan source code for security violations
    let sourceCode
    try {
        sourceCode = await readFile(join(pluginPath, mainFileName), 'utf-8')
    } catch (error) {
        return { plugin: null, reason: `Failed to read main file: ${error.message}` }
    }

    const sourceValidation = validatePluginSource(sourceCode)
    if (!sourceValidation.valid) {
        logger.warn(`[SOURCE] '${manifest.id}' blocked — security violations:`)
        for (const v of sourceValidation.violations) logger.warn(`  - ${v}`)
        return {
            plugin: null,
            reason: `Security violations: ${sourceValidation.violations.join(', ')}`
        }
    }

    // Import the main file
    let pluginExports
    try {
        const mainFilePath = join(pluginPath, mainFileName)
        // Convert to file URL for dynamic import (required on Windows)
        const importPath = pathToFileURL(mainFilePath).href
        const raw = await import(importPath)
        pluginExports = raw.default ?? raw
    } catch (error) {
        return { plugin: null, reason: `Failed to import main file: ${error.message}` }
    }

    // Validate exported API surface
    const exportsValidation = validatePluginExports(pluginExports)
    if (!exportsValidation.valid) {
        return {
            plugin: null,
            reason: `Missing required exports: ${exportsValidation.missing.join(', ')}`
        }
    }

    // Resolve icon file (manifest.icon takes priority, fallback to default list)
    const iconCandidates = manifest.icon
        ? [manifest.icon, ...iconFileNames.filter((n) => n !== manifest.icon)]
        : iconFileNames
    const iconFileName =
        iconCandidates.find((name) => pluginFiles.some((f) => f.isFile() && f.name === name)) ??
        null

    // Assemble plugin object
    const iconPath = iconFileName ? pathToFileURL(join(pluginPath, iconFileName)).href : null
    const protocolIconUrl = iconPath ? `transeki://icon/?path=${iconPath}` : null
    const plugin = createPlugin({
        info: manifest,
        icon: protocolIconUrl,
        actions: pluginExports
    })

    if (process.env.NODE_ENV === 'development') {
        logger.debug(`Loaded plugin [${manifest.id}] with files:`, {
            manifest: manifestFileName,
            main: mainFileName,
            icon: iconFileName ?? 'none'
        })
    }

    return { plugin, reason: null }
}

async function loadPlugins() {
    logger.info('Loading plugins...')
    pluginRegistry.clear()

    const possiblePlugins = await discoverPluginDirectories()
    if (possiblePlugins.length === 0) return []

    const pluginsPath = getPluginsFolderPath()
    const loadedPlugins = []
    const failures = []

    for (const pluginDir of possiblePlugins) {
        const { plugin, reason } = await loadSinglePlugin(pluginDir, pluginsPath)
        if (plugin) {
            const pluginId = plugin.info.id
            if (pluginRegistry.has(pluginId)) {
                logger.warn(
                    `[SKIP] Duplicate plugin ID '${pluginId}' in folder '${pluginDir.name}', skipping.`
                )
                failures.push({ name: pluginDir.name, reason: `Duplicate plugin ID: ${pluginId}` })
            } else {
                pluginRegistry.set(pluginId, plugin)
                loadedPlugins.push(plugin)
                logger.info(`[OK] Loaded [${pluginId}] from {${pluginDir.name}}`)
            }
        } else {
            failures.push({ name: pluginDir.name, reason })
            logger.warn(`[X] Failed to load {${pluginDir.name}}: ${reason}`)
        }
    }

    logger.info(`Successfully loaded ${loadedPlugins.length}/${possiblePlugins.length} plugins.`)
    if (failures.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Failed plugins:', { failures })
    }

    return loadedPlugins
}

export {
    getPluginsFolderPath,
    initializePluginsFolder,
    loadPlugins,
    getPlugin,
    getAllPlugins,
    getPluginIds,
    createPluginModules
}

import { getFolderPath } from './appDataManager'
import { createModuleLogger } from './logger'
import { join } from 'path'
import { mkdir, stat, readdir, readFile } from 'fs/promises'
import axios from 'axios'

const logger = createModuleLogger('Plugins')

const manifestFileNames = ['manifest.json', 'meta.json', 'metadata.json']
const mainFileNames = ['index.js', 'main.js']
const iconFileNames = ['icon.png']

const pluginRegistry = new Map()

// --- Validation ---

function isValidPluginDirectoryName(name) {
    if (name.includes('/') || name.includes('\\') || name.includes('..')) return false
    if (name.startsWith('.')) return false
    const suspiciousChars = ['<', '>', ':', '"', '|', '?', '*']
    if (suspiciousChars.some((char) => name.includes(char))) return false
    if (name.trim().length === 0) return false
    return true
}

function validateManifest(manifest) {
    const errors = []

    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        return { valid: false, errors: ['manifest must be a JSON object'] }
    }

    // id: required, reverse-domain format (e.g. com.author.plugin-name)
    if (!manifest.id || typeof manifest.id !== 'string') {
        errors.push('missing required field: id')
    } else if (!/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(manifest.id)) {
        errors.push('id must be in reverse-domain format (e.g. com.author.plugin-name)')
    }

    // name: required, non-empty string
    if (!manifest.name || typeof manifest.name !== 'string' || manifest.name.trim().length === 0) {
        errors.push('missing required field: name')
    }

    // version: required, semver (x.y.z)
    if (!manifest.version || typeof manifest.version !== 'string') {
        errors.push('missing required field: version')
    } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
        errors.push('version must use semver format (e.g. 1.0.0)')
    }

    // main: optional — if present, must be a safe .js filename
    if (manifest.main !== undefined) {
        if (typeof manifest.main !== 'string' || manifest.main.trim().length === 0) {
            errors.push('main must be a non-empty string if specified')
        } else if (!manifest.main.endsWith('.js')) {
            errors.push('main must end with .js')
        } else if (
            manifest.main.includes('/') ||
            manifest.main.includes('\\') ||
            manifest.main.includes('..')
        ) {
            errors.push('main must be a filename only (no path separators or ..)')
        }
    }

    // icon: optional — if present, must be a safe filename
    if (manifest.icon !== undefined) {
        if (typeof manifest.icon !== 'string' || manifest.icon.trim().length === 0) {
            errors.push('icon must be a non-empty string if specified')
        } else if (
            manifest.icon.includes('/') ||
            manifest.icon.includes('\\') ||
            manifest.icon.includes('..')
        ) {
            errors.push('icon must be a filename only (no path separators or ..)')
        }
    }

    // description, author: optional strings
    for (const field of ['description', 'author']) {
        if (manifest[field] !== undefined && typeof manifest[field] !== 'string') {
            errors.push(`${field} must be a string if specified`)
        }
    }

    return { valid: errors.length === 0, errors }
}

const BLOCKED_PATTERNS = [
    {
        pattern: /child_process/,
        message: "use of 'child_process' is not allowed"
    },
    {
        pattern: /\beval\s*\(/,
        message: 'use of eval() is not allowed'
    },
    {
        pattern: /new\s+Function\s*\(/,
        message: 'use of new Function() is not allowed'
    },
    {
        pattern: /(?:require|import)\s*\(\s*['"]fs['"]\s*\)|from\s+['"]fs['"]|import\s+['"]fs['"]/,
        message: "direct filesystem access via 'fs' module is not allowed"
    },
    {
        pattern:
            /(?:require|import)\s*\(\s*['"](?:http|https|net|dgram)['"]\s*\)|from\s+['"](?:http|https|net|dgram)['"]|import\s+['"](?:http|https|net|dgram)['"]/,
        message:
            'direct network access via built-in modules is not allowed (use modules.axios instead)'
    }
]

function scanPluginSource(sourceCode, pluginId) {
    const violations = []
    for (const { pattern, message } of BLOCKED_PATTERNS) {
        if (pattern.test(sourceCode)) {
            violations.push(message)
        }
    }
    if (violations.length > 0) {
        logger.warn(`[SCAN] '${pluginId}' blocked — security violations detected:`)
        for (const v of violations) logger.warn(`  - ${v}`)
    }
    return { safe: violations.length === 0, violations }
}

function validatePluginExports(exports) {
    const required = ['search', 'getManga', 'getChapter']
    const missing = required.filter((fn) => typeof exports[fn] !== 'function')
    return { valid: missing.length === 0, missing }
}

// --- Plugin construction ---

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

// --- Module injection ---

// Plugin calling convention:
//   plugin.actions.search(query, modules)
//   plugin.actions.getManga(id, modules)
//   plugin.actions.getChapter(id, chapterNum, modules)
function createPluginModules() {
    return { axios }
}

// --- Registry accessors ---

function getPlugin(id) {
    return pluginRegistry.get(id) || null
}

function getAllPlugins() {
    return Array.from(pluginRegistry.values())
}

function getPluginIds() {
    return Array.from(pluginRegistry.keys())
}

// --- Core loading ---

function getPluginsFolderPath() {
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
    const { valid, errors } = validateManifest(manifest)
    if (!valid) {
        return { plugin: null, reason: `Invalid manifest: ${errors.join(', ')}` }
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

    const scanResult = scanPluginSource(sourceCode, manifest.id)
    if (!scanResult.safe) {
        return { plugin: null, reason: `Security violations: ${scanResult.violations.join(', ')}` }
    }

    // Import the main file
    let pluginExports
    try {
        const mainFilePath = join(pluginPath, mainFileName)
        // On Windows, convert the path to a file URL to handle spaces and other special chars correctly
        const importPath = process.platform === 'win32' ? `file://${mainFilePath}` : mainFilePath
        const raw = await import(importPath)
        pluginExports = raw.default || raw
    } catch (error) {
        return { plugin: null, reason: `Failed to import main file: ${error.message}` }
    }

    // Validate exported API surface
    const { valid: exportsValid, missing } = validatePluginExports(pluginExports)
    if (!exportsValid) {
        return { plugin: null, reason: `Missing required exports: ${missing.join(', ')}` }
    }

    // Resolve icon file (manifest.icon takes priority, fallback to default list)
    const iconCandidates = manifest.icon
        ? [manifest.icon, ...iconFileNames.filter((n) => n !== manifest.icon)]
        : iconFileNames
    const iconFileName =
        iconCandidates.find((name) => pluginFiles.some((f) => f.isFile() && f.name === name)) ||
        null

    // Assemble plugin object
    const iconPath = iconFileName ? `file://${join(pluginPath, iconFileName)}` : null
    const plugin = createPlugin({
        info: manifest,
        icon: iconPath,
        actions: pluginExports
    })

    if (process.env.NODE_ENV === 'development') {
        logger.debug(`Loaded plugin [${manifest.id}] with files:`, {
            manifest: manifestFileName,
            main: mainFileName,
            icon: iconFileName || 'none'
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
            logger.warn(`[X] Failed to load [${pluginDir.name}]: ${reason}`)
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

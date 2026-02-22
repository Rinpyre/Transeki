// BLOCKED_PATTERNS defines Node.js built-in imports that plugins are forbidden from using.
// This is a best-effort static scan — obfuscated code can bypass it, but it stops the obvious cases.
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

    // main: optional — if present, must be a safe .js filename with no path components
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

    // icon: optional — if present, must be a safe filename with no path components
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

function validatePluginSource(sourceCode) {
    const violations = []
    for (const { pattern, message } of BLOCKED_PATTERNS) {
        if (pattern.test(sourceCode)) {
            violations.push(message)
        }
    }
    return { valid: violations.length === 0, violations }
}

function validatePluginExports(exports) {
    const required = ['search', 'getManga', 'getChapter']
    const missing = required.filter((fn) => typeof exports[fn] !== 'function')
    return { valid: missing.length === 0, missing }
}

export { isValidPluginDirectoryName, validateManifest, validatePluginSource, validatePluginExports }

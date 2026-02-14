import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { getFolderPath } from './appDataManager'
import { join } from 'path'

const logDir = join(getFolderPath('logs'))

// Define custom colors
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'white', // or 'white', 'grey', etc.
    debug: 'cyan' // or 'cyan', 'magenta', etc.
})

// Readable text format (for both files and console)
const readableFormat = winston.format.printf(({ timestamp, level, message, module }) => {
    const prefix = module ? `[${module}]` : ''
    const levelPadded = level.toUpperCase().padEnd(6)
    return `[${timestamp}] ${levelPadded} ${prefix} ${message}`
})

const baseLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    transports: [
        // Errors only - keep for 30 days
        new DailyRotateFile({
            dirname: logDir,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '5m',
            maxFiles: '30d',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                readableFormat
            )
        }),
        // Combined logs (JSON) - keep for 7 days
        new DailyRotateFile({
            dirname: logDir,
            filename: 'transeki-%DATE%.jsonl',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '7d',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        }),
        // Combined logs (readable format) - keep for 7 days
        new DailyRotateFile({
            dirname: logDir,
            filename: 'transeki-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '7d',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                readableFormat
            )
        })
    ]
})

if (process.env.NODE_ENV === 'development') {
    baseLogger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                readableFormat,
                winston.format.colorize({ all: true }) // Colors whole line
            )
        })
    )
}

/**
 * Create a logger for a specific module
 * @param {string} moduleName - Name of the module (e.g., "Plugins", "SearchBar")
 * @returns {object} Logger instance with module context
 */
export function createModuleLogger(moduleName) {
    return baseLogger.child({ module: moduleName })
}

export default baseLogger

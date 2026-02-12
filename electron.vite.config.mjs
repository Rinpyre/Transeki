import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    main: {},
    preload: {
        // FORCE CommonJS output to prevent "Cannot use import statement" error
        build: {
            lib: {
                entry: 'src/preload/index.js',
                formats: ['cjs'] // This forces .js output instead of .mjs
            },
            rollupOptions: {
                external: ['electron'] // Manually externalize electron
            }
        }
    },
    renderer: {
        resolve: {
            alias: {
                '@': resolve('src/renderer/src'),
                '@renderer': resolve('src/renderer/src'),
                '@components': resolve('src/renderer/src/components'),
                '@handlers': resolve('src/renderer/src/handlers'),
                '@routes': resolve('src/renderer/src/routes'),
                '@assets': resolve('src/renderer/src/assets'),
                '@utils': resolve('src/renderer/utils')
            }
        },
        plugins: [react()]
    }
})

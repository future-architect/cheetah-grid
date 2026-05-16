import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = __dirname
const repoRoot = path.resolve(__dirname, '../..')

function getVueCheetahGridPath () {
  const localPath = path.resolve(__dirname, '../vue-cheetah-grid/lib/index.js')
  return fs.existsSync(localPath) ? localPath : 'vue-cheetah-grid'
}

function getCheetahGridAliases () {
  const jsPath = path.resolve(__dirname, '../cheetah-grid/dist/main.mjs')
  const cssPath = path.resolve(__dirname, '../cheetah-grid/dist/main.css')
  if (!fs.existsSync(jsPath) || !fs.existsSync(cssPath)) {
    return []
  }
  return [
    { find: 'cheetah-grid/main.css', replacement: cssPath },
    { find: 'cheetah-grid', replacement: jsPath }
  ]
}

function copyFile (from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
}

function copyDirectory (from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const fileName of fs.readdirSync(from)) {
    copyFile(path.join(from, fileName), path.join(to, fileName))
  }
}

function staticFilesPlugin (outDir) {
  return {
    name: 'cheetah-grid-demo-static-files',
    closeBundle () {
      copyDirectory(
        path.resolve(__dirname, './animals-icons'),
        path.resolve(outDir, './animals-icons')
      )
      copyFile(
        path.resolve(__dirname, './icon_512x512.ico'),
        path.resolve(outDir, './icon_512x512.ico')
      )
    }
  }
}

export default defineConfig(({ mode }) => {
  const production = mode === 'production'
  const outDir = production
    ? path.resolve(repoRoot, './docs')
    : path.resolve(__dirname, './.devdocs')

  return {
    root,
    base: './',
    plugins: [
      vue(),
      staticFilesPlugin(outDir)
    ],
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    resolve: {
      alias: [
        ...getCheetahGridAliases(),
        { find: 'vue-cheetah-grid', replacement: getVueCheetahGridPath() }
      ]
    },
    server: {
      fs: {
        allow: [repoRoot]
      }
    },
    build: {
      outDir,
      emptyOutDir: false,
      sourcemap: !production,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: assetInfo => {
            const name = assetInfo.names?.[0] || assetInfo.name || ''
            if (/\.(?:png|jpe?g|gif|svg|ico)$/i.test(name)) {
              return 'assets/images/[name][extname]'
            }
            return 'assets/[name][extname]'
          }
        }
      }
    }
  }
})

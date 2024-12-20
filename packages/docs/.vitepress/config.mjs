import fs from 'fs'
import path from 'path'
import semver from 'semver'
import { defineConfig } from 'vitepress'
import { extractLinks } from './lib/sidebar-links.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const repoUrl = 'https://github.com/future-architect/cheetah-grid'

const extracted = extractLinks()
/** @type {import("vitepress").DefaultTheme.Sidebar} */
const links = extracted.items

const pkg = requireJson('../../cheetah-grid/package.json')

function resolve (dir) {
  const p = path.join(__dirname, dir)
  return p
}
function devPath (basePath) {
  const rootPath = resolve(basePath)
  const pkg = requireJson(path.join(rootPath, 'package.json'))
  const p = path.join(rootPath, pkg.unpkg || pkg.main)
  return p
}

function requireJson (jsonPath) {
  const p = path.isAbsolute(jsonPath) ? jsonPath : resolve(jsonPath)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export default async ({ mode }) => {
  const production = mode === 'production'
  const scriptPaths = []
  const devDir = resolve('../public/dev')
  if (production) {
    const gridVersion = `${semver.major(pkg.version)}.${semver.minor(pkg.version)}.0-0`
    const fallbackVersion = semver.minor(pkg.version) === 0 ? `${semver.major(pkg.version) - 1}` : `${semver.major(pkg.version)}.${semver.minor(pkg.version) - 1}.0`
    const v = `^${gridVersion}||^${fallbackVersion}`
    scriptPaths.push(
      `https://unpkg.com/cheetah-grid@${v}`
    )
  } else {
    if (!fs.existsSync(devDir)) {
      fs.mkdirSync(devDir)
    }
    for (const p of [
      devPath('../../cheetah-grid/')
    ]) {
      const jsname = path.basename(p)
      const dest = path.join(devDir, jsname)
      fs.copyFileSync(p, dest)
      scriptPaths.push(`/cheetah-grid/documents/dev/${jsname}`)
    }
  }
  return defineConfig({
    title: 'Cheetah Grid',
    description: 'Cheetah Grid is the fastest open-source data table for web.',
    outDir: resolve('../../../docs/documents'),
    ignoreDeadLinks: 'localhostLinks',
    markdown: {
      lineNumbers: true,
      config (md) { }
    },
    vite: {
      resolve: {
        alias: {
          vue: resolve('../node_modules/vue/')
        }
      }
    },
    locales: {
      root: {
        lang: 'ja'
      }
    },
    head: [
      [
        'link',
        {
          rel: 'icon',
          href: '/cheetah-grid/documents/icon_512x512.svg',
          type: 'image/svg+xml'
        }
      ],
      ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }],
      ['link', { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' }],

      ...scriptPaths.map(p => ['script', { src: p }])
    ],
    base: '/cheetah-grid/documents/',
    themeConfig: {
      logo: '/logo.svg',
      footer: {
        copyright: `©2015 - ${new Date().getFullYear()} Future Corporation. Author Yosuke Ota. Code licensed under the MIT License.`
      },
      search: {
        provider: 'local',
        options: {
          detailedView: true
        }
      },
      editLink: {
        pattern: `${repoUrl}/edit/master/packages/docs/:path`
      },
      outline: {
        level: 'deep'
      },
      nav: [
        {
          text: 'Introduction',
          link: '/introduction/'
        },
        {
          text: 'API',
          items: [
            {
              text: 'for JavaScript',
              link: '/api/js/'
            },
            {
              text: 'for Vue.js',
              link: '/api/vue/'
            },
            {
              text: 'for React',
              link: 'https://github.com/future-architect/cheetah-grid/tree/master/packages/react-cheetah-grid#readme'
            }
          ]
        },
        {
          text: 'Demo',
          link: 'https://future-architect.github.io/cheetah-grid/'
        }
      ],

      sidebar: links,

      socialLinks: [
        {
          icon: 'github',
          link: repoUrl
        }
      ]
    }
  })
}

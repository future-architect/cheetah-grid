'use strict'

const fs = require('fs')
const path = require('path')
const pkg = require('../../cheetah-grid/package.json')
const semver = require('semver')
const rm = require('rimraf')
const { compare } = require('./frontmatter')
const gridVersion = `${semver.major(pkg.version)}.${semver.minor(pkg.version)}`
const failbackVersion = `${semver.major(pkg.version)}.${semver.minor(pkg.version) - 1}`

const DOC_ROOT = path.resolve(__dirname, '../')

const production = process.env.NODE_ENV === 'production'

const scriptPaths = []
const devdir = resolve('./public/dev')
if (production) {
  rm.sync(path.join(devdir, '*'))
  scriptPaths.push(
    `https://unpkg.com/cheetah-grid@${gridVersion}||${failbackVersion}`,
    `https://unpkg.com/vue-cheetah-grid@${gridVersion}||${failbackVersion}`
  )
} else {
  if (!fs.existsSync(devdir)) {
    fs.mkdirSync(devdir)
  }
  for (const p of [
    require.resolve(resolve('../../cheetah-grid/')),
    require.resolve(resolve('../../vue-cheetah-grid/'))
  ]) {
    const jsname = path.basename(p)
    const dest = path.join(devdir, jsname)
    fs.copyFileSync(p, dest)
    scriptPaths.push(`/dev/${jsname}`)
  }
}

function listupLinks (parent = '/') {
  const result = {}
  const paths = []
  const searchPath = path.resolve(DOC_ROOT, `.${parent}`)
  for (const file of fs.readdirSync(searchPath)) {
    if (path.extname(file) === '.md') {
      if (file === 'README.md') {
        paths.push(parent)
      } else {
        paths.push(parent + path.basename(file, '.md'))
      }
    } else if (
      fs.statSync(path.resolve(searchPath, file)).isDirectory() &&
      file !== 'node_modules' &&
      file !== '.vuepress'
    ) {
      const childPath = `${parent}${file}/`
      const child = listupLinks(childPath)
      if (Object.keys(child).length) {
        if (child[childPath].length) {
          paths.push(`${parent}${file}/`)
        }
        Object.assign(result, child)
      }
    }
  }
  paths.sort(compare)
  if (paths.length) {
    result[parent] = paths
  }
  return result
}

function adjustLinks (links) {
  for (const key in links) {
    if (key !== '/') {
      const parent = key.replace(/\/([^/]*)\/$/, '')
      links[key] = [
        '/',
        ...(parent ? [`${parent}/`] : []),
        ...links[key]
      ]
    }
  }
}
const links = listupLinks()
// links['/'] = ['/', '/introduction/', '/api/']
adjustLinks(links)
console.log(links)

function resolve (dir) {
  const p = path.join(__dirname, dir)
  return p
}

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // DEMOを動的に起動させるために`vue`に`vue.esm.js`を利用させます。
        'vue': resolve('../node_modules/vue/dist/vue.esm.js')
      }
    }
  },
  base: process.env.VUEPRESS_BASE || '/cheetah-grid/documents/',
  title: 'Cheetah Grid',
  description: 'Cheetah Grid is the fastest open-source data table for web.',
  dest: resolve('../../../docs/documents'),
  serviceWorker: false,
  markdown: {
    lineNumbers: true
  },
  head: [
    ['link', { rel: 'icon', href: '/icon_512x512.ico' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }],
    ['link', { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' }],

    ...scriptPaths.map(p => ['script', { src: p }])
  ],
  locales: {
    '/': {
      lang: 'ja'
    }
  },
  themeConfig: {
    logo: '/logo.png',
    repo: 'https://github.com/future-architect/cheetah-grid',
    docsRepo: 'https://github.com/future-architect/cheetah-grid',
    docsDir: 'packages/docs',
    docsBranch: 'master',
    editLinks: true,
    lastUpdated: true,
    // serviceWorker: {
    //   updatePopup: true
    // },
    evergreen: true,
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
          }
        ]
      },
      {
        text: 'Demo',
        link: 'https://future-architect.github.io/cheetah-grid/'
      }
    ],
    sidebar: links
  }
}

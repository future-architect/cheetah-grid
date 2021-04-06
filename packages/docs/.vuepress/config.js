'use strict'

const fs = require('fs')
const path = require('path')
const pkg = require('../../cheetah-grid/package.json')
const semver = require('semver')
const rm = require('rimraf')
const { compare, inferTitle } = require('./frontmatter')

const DOC_ROOT = path.resolve(__dirname, '../')

const production = process.env.NODE_ENV === 'production'

function devPath(basePath) {
  const rootPath = resolve(basePath)
  const pkg = require( path.join(rootPath, 'package.json'))
  const p = path.join(rootPath, pkg.unpkg || pkg.main)
  return require.resolve(p)
}

const scriptPaths = []
const devdir = resolve('./public/dev')
if (production) {
  const gridVersion = `${semver.major(pkg.version)}.${semver.minor(pkg.version)}.0-0`
  const fallbackVersion = semver.minor(pkg.version) === 0 ? `${semver.major(pkg.version) - 1}` : `${semver.major(pkg.version)}.${semver.minor(pkg.version) - 1}.0`
  const v = `^${gridVersion}||^${fallbackVersion}`
  rm.sync(path.join(devdir, '*'))
  scriptPaths.push(
    `https://unpkg.com/cheetah-grid@${v}`,
    `https://unpkg.com/vue-cheetah-grid@${v}`
  )
} else {
  if (!fs.existsSync(devdir)) {
    fs.mkdirSync(devdir)
  }
  for (const p of [
    devPath('../../cheetah-grid/'),
    devPath('../../vue-cheetah-grid/')
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

function groupSubmenu (links, rootLink) {
  const menus = links[rootLink]
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    if (menu === rootLink) {
      continue
    }
    const subMenus = links[menu]
    if (subMenus) {
      const newMenus = [...menus]
      newMenus[i] = {
        title: inferTitle(menu),
        collapsable: false,
        children: subMenus
      }
      links[menu] = newMenus
    }
  }
}

function adjustLinks (links) {
  for (const key in links) {
    if (key !== '/') {
      const menus = links[key]
      let parent = parentPath(key)
      while (parent && parent !== '/') {
        if (!menus.includes(parent)) {
          menus.unshift(parent)
        }
        parent = parentPath(parent)
      }
    }
  }

  function parentPath (p) {
    return `${p.split(/[/\\]/g).slice(0, -2).join('/')}/`
  }
}

const links = listupLinks()

groupSubmenu(links, '/api/js/')
groupSubmenu(links, '/api/vue/')

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
        vue: resolve('../node_modules/vue/dist/vue.esm.js')
      }
    },
    externals: {
      vue: 'Vue'
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
    ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/core-js/3.7.0/minified.js'}],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/vue@2.6/dist/vue.min.js' }],

    ...scriptPaths.map(p => ['script', { src: p }])
  ],
  locales: {
    '/': {
      lang: 'en-US'
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

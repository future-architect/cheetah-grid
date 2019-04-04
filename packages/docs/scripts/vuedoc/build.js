'use strict'
const vuedoc = require('@vuedoc/md')

const chalk = require('chalk')
const path = require('path')
const readFiles = require('fs-readdir-recursive')
const fs = require('fs')
const md = require('./markdown')
const merge = require('./merge')

function handleError (message) {
  console.error(`${chalk.red('error')} ${message}`)
  process.exit(1);//eslint-disable-line
}

const vueRoot = path.resolve(path.join(__dirname, '../../../vue-cheetah-grid'))
const files = readFiles(path.join(vueRoot, 'lib'))

if (files.length === 0) {
  handleError('not found vue')
  return
}

const docRoot = path.join(__dirname, '../../api/vue/components')

if (!fs.existsSync(docRoot)) { // eslint-disable-line no-sync
  fs.mkdirSync(docRoot) // eslint-disable-line no-sync
}

const components = {}
const promise = []
for (let i = 0; i < files.length; i++) {
  const fileInfo = path.parse(files[i])
  const filename = path.join(vueRoot, 'lib', fileInfo.dir, fileInfo.base)
  if (/\.vue$/.test(filename)) {
    const docFilename = path.join(docRoot, fileInfo.dir, fileInfo.name)

    promise.push(vuedoc.join({ filenames: [filename] })
      .then((component) => {
        components[component.name] = {
          filename,
          docFilename,
          component
        }
      }))
  }
}

Promise.all(promise).then(() => {
  for (const name in components) {
    const {
      docFilename,
      component
    } = components[name]

    const comp = merge.merge([...mixinComponents(component, components), component])

    writeMarkdown(docFilename, comp)
  }
})
function mixinComponents (component, components) {
  return component.keywords.filter((k) => k.name === 'mixin')
    .map((k) => k.description)
    .map((name) => components[name])
    .filter((c) => c)
    .map((c) => c.component)
}

function writeMarkdown (docFilename, comp) {
  const dir = path.dirname(docFilename)

  if (dir !== docRoot) {
    console.log(`ignore${docFilename}`)
    return
  }

  const mdFilename = `${docFilename}.md`
  const baseMd = fs.existsSync(mdFilename) ? fs.readFileSync(mdFilename, 'utf8') : ''
  const contents = renderMarkdown(docFilename, comp, baseMd)
  fs.writeFile(mdFilename, contents, (err) => {
    if (err) {
      handleError(err.message)
    }
  })
}

function renderMarkdown (docFilename, comp, baseMd) {
  const componentName = path.basename(docFilename)
  return md.render(componentName, comp, baseMd)
}

'use strict'

const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const md = require('./markdown')

function handleError (message) {
  console.error(`${chalk.red('error')} ${message}`)
  process.exit(1);//eslint-disable-line
}

const { getAllVueComponentMetadata } = require('../../../vue-cheetah-grid/scripts/lib/metadata')

const docRoot = path.join(__dirname, '../../api/vue/components')

if (!fs.existsSync(docRoot)) { // eslint-disable-line no-sync
  fs.mkdirSync(docRoot) // eslint-disable-line no-sync
}

main()

async function main () {
  const allMetadata = await getAllVueComponentMetadata()

  for (const { component, relativeFilename, componentName } of Object.values(allMetadata)) {
    const fileInfo = path.parse(relativeFilename)
    const docFilename = path.join(docRoot, fileInfo.dir, `${fileInfo.name}.md`)
    writeMarkdown(docFilename, component, componentName)
  }
}

function writeMarkdown (docFilename, comp, componentName) {
  const dir = path.dirname(docFilename)

  if (dir !== docRoot) {
    console.log(`ignore${docFilename}`)
    return
  }

  const baseMd = fs.existsSync(docFilename) ? fs.readFileSync(docFilename, 'utf8') : ''
  const contents = renderMarkdown(comp, { componentName, fileName: docFilename }, baseMd)
  fs.writeFile(docFilename, contents, (err) => {
    if (err) {
      handleError(err.message)
    }
  })
}

function renderMarkdown (comp, context, baseMd) {
  return md.render(context, comp, baseMd)
}

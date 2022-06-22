const fs = require('fs')
const path = require('path')
const vuedoc = require('@vuedoc/md')
const merge = require('./merge')

/**
 * @typedef {object} ComponentPropMetadata
 * @property {string} name
 * @property {string} description
 * @property {{ name: string, description: string }[]} keywords
 * @property {string | { type: string, required: boolean, default: any }} value
 */
/**
 * @typedef {object} ComponentMetadata
 * @property {string} name
 * @property {string} description
 * @property {{ name: string, description: string }[]} keywords
 * @property {ComponentPropMetadata[]} props
 */

module.exports = {
  getAllVueComponentMetadata,
  getPropType
}

/**
 * @returns { { [key: string]: { component: ComponentMetadata, filename: string, relativeFilename: string, componentName: string } } }
 */
async function getAllVueComponentMetadata () {
  const vueRoot = path.resolve(path.join(__dirname, '../../lib'))

  const allMetadata = {}

  await Promise.all([...listupFiles(vueRoot)].map(async filename => {
    return getMetadata(filename).then(component => {
      allMetadata[component.name] = {
        relativeFilename: path.relative(vueRoot, filename),
        filename,
        componentName: path.basename(filename, '.vue'),
        component
      }
    })
  }))

  for (const [name, { component }] of Object.entries(allMetadata)) {
    const comp = merge.merge([...mixinComponents(component, allMetadata), component])

    allMetadata[name].component = comp
  }

  return allMetadata
}

/**
 * @param {ComponentPropMetadata} prop
 */

function getPropType (prop) {
  const customTypeKeyword = prop.keywords.find(({ name, description }) => name === 'type' && description)
  const customType = customTypeKeyword && customTypeKeyword.description.replace(/\{(.+?)\}/, '$1')
  const type = customType || prop.value.type || prop.value || 'any'
  return parseType(type)
}

function parseType (type) {
  if (type && type.type === 'ArrayExpression') {
    return [...(new Set(type.elements.map((typeIdentifier) => typeIdentifier.name)))]
  }
  return type
}

function getMetadata (filePath) {
  return vuedoc.join({ filenames: [filePath] })
}

function mixinComponents (component, allMetadata) {
  return component.keywords.filter((k) => k.name === 'mixin')
    .map((k) => k.description)
    .map((name) => allMetadata[name])
    .filter((c) => c)
    .map((c) => c.component)
}

function * listupFiles (dir) {
  for (const filename of fs.readdirSync(dir)) {
    const filePath = path.join(dir, filename)
    if (filename.endsWith('.vue')) {
      yield filePath
    } else if (
      fs.existsSync(filePath) &&
            fs.statSync(filePath).isDirectory()
    ) {
      yield * listupFiles(filePath)
    }
  }
}

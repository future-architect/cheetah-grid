const fs = require('fs')
const path = require('path')
const vuedoc = require('@vuedoc/md')
const merge = require('./merge')

/**
 * @typedef {object} Keyword
 * @property {string} name
 * @property {string} description
 */
/**
 * @typedef {object} ComponentPropMetadata
 * @property {string} name
 * @property {string} description
 * @property {Keyword[]} keywords
 * @property {string | { type: string, required: boolean, default: any }} value
 */
/**
 * @typedef {object} ComponentMethodMetadata
 * @property {string} name
 * @property {string} description
 * @property {Keyword[]} keywords
 * @property {{ type: 'FunctionExpression' }} value
 * @property {'public'|undefined} visibility
 * @property {string[]} args
 * @property {unknown} return
 */
/**
 * @typedef {object} ComponentSlotMetadata
 * @property {string} name
 * @property {string} description
 */
/**
 * @typedef {object} ComponentMetadata
 * @property {string} name
 * @property {string} description
 * @property {Keyword[]} keywords
 * @property {ComponentPropMetadata[]} props
 * @property {ComponentMethodMetadata[]} methods
 * @property {ComponentSlotMetadata[]} slots
 */

module.exports = {
  getAllVueComponentMetadata,
  getPropType,
  isRequiredProp,
  getMethodSignature
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
  const customType = customTypeKeyword && getKeywordType(customTypeKeyword)
  const type = customType || prop.value.type || prop.value || 'any'
  return parseType(type)
}

/**
 * @param {ComponentMethodMetadata} method
 */
function getMethodSignature (method) {
  const paramKeywords = {}
  for (const keyword of method.keywords.filter(({ name, description }) => name === 'param')) {
    const typeClosing = keyword.description.indexOf('}')
    if (typeClosing < 0) continue
    const paramNameAndDesc = keyword.description.slice(typeClosing + 1).trim()
    const props = /^\[?(\p{ID_Start}\p{ID_Continue}*(?:\.\p{ID_Start}\p{ID_Continue}*)*)/u.exec(paramNameAndDesc)[1].split('.')
    if (props.length === 1) {
      paramKeywords[props[0]] = getKeywordType(keyword)
    }
  }

  const argsSignature = method.args
    .map(arg => {
      const keyword = paramKeywords[arg]
      return (keyword && getKeywordType(keyword)) || 'any'
    })
    .join(', ')
  const returnKeyword = method.keywords.find(({ name, description }) => name === 'return' && description)
  const returnType = (returnKeyword && getKeywordType(returnKeyword)) || 'any'
  return `(${argsSignature}) => ${returnType}`
}
/**
 * @param {Keyword} keyword
 */
function getKeywordType (keyword) {
  return /^\s*\{(.+)\}/u.exec(keyword.description)?.[1]
}

/**
 * @param {ComponentPropMetadata} prop
 */
function isRequiredProp (prop) {
  return typeof prop.value !== 'string' && Boolean(prop.value.required)
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

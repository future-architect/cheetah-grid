const fs = require('fs')
const path = require('path')
const { getAllVueComponentMetadata, getPropType, isRequiredProp, getMethodSignature } = require('./lib/metadata')
const cheetahGrid = require('cheetah-grid')
const { EVENT_TYPE } = cheetahGrid.ListGrid
const vue3Emits = Object.keys(EVENT_TYPE)
  .map(k => EVENT_TYPE[k].replace(/_/g, '-').toLowerCase())
  .reduce((r, v) => {
    r[v] = null
    return r
  }, {})

const additionalProperties = {
  CGrid:
      'rawGrid: cheetahGrid.ListGrid<unknown>;'
}

async function main () {
  const allMetadata = await getAllVueComponentMetadata()

  /** @type {string[]} */
  const componentTypes = []
  const components = []

  for (const { component, componentName, filename } of Object.values(allMetadata)) {
    if (filename.includes('/c-grid/')) continue
    const props = component.props.map(prop => {
      return `
/** ${prop.description} */
${camelCase(prop.name)}${isRequiredProp(prop) ? '' : '?'}: ${normalizePropType(prop)};
`.trim()
    })
    const propertyTypes =
    [
      ...component.methods
        .filter(method => method.visibility === 'public')
        .map(method => {
          return `
/** ${method.description} */
${method.name}: ${getMethodSignature(method)};
`.trim()
        }),
      ...additionalProperties[componentName] ? [additionalProperties[componentName]] : []
    ]
    const emits = Object.keys(vue3Emits).map(emitName => {
      return `
on${pascalCase(emitName)}?: Function;
`.trim()
    })
    const slots = component.slots.map(prop => {
      return `
/** ${prop.description} */
"${prop.name}"?: Slot<{} | undefined>;
`.trim()
    })
    componentTypes.push(`
/** ${component.description} */
export const ${componentName}: ComponentConstructor<
  {
    ${indent([...props, ...emits].join('\n'), 4)}
  },
  {
    ${indent(propertyTypes.join('\n'), 4)}
  },
  {
    ${indent(slots.join('\n'), 4)}
  }
>;
`.trim())
    components.push(`
/** ${component.description} */
${componentName}: typeof ${componentName};
"${kebabCase(componentName)}": typeof ${componentName};
`.trim())
  }

  const typePath = path.resolve(path.join(__dirname, '../types/vue3.d.ts'))
  const typeDir = path.dirname(typePath)
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir)
  }
  fs.writeFileSync(typePath, `${`
import type { PublicProps, ComponentPublicInstance, Slot } from "vue";
import * as cheetahGrid from 'cheetah-grid'
export { cheetahGrid }
export function storeElement (vm: ComponentPublicInstance): void;
export function removeElement (vm: ComponentPublicInstance): void;
export function getComponentFromElement (element: HTMLElement): ComponentPublicInstance | undefined;

type ComponentConstructor<Props = {}, Properties = {}, Slots = {}> = {
  new (): {
    $props: PublicProps & Props
    $slots: Slots
  } & Properties
}

${componentTypes.join('\n')}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
${indent(components.join('\n'), 4)}
  }
}

export default CGrid;

export declare function install (Vue: any /* Vue 2 Vue object or Vue 3 App instance */): void;
`.trim()}\n`)

  function indent (str, indent) {
    return str.split('\n').map(line => `${' '.repeat(indent)}${line}`).join('\n')
  }

  function camelCase (str) {
    return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
  }

  function normalizePropType (prop) {
    const type = getPropType(prop)
    return (Array.isArray(type) ? type.join('|') : type)
      .replace('Number', 'number')
      .replace('String', 'string')
      .replace('Boolean', 'boolean')
      .replace('Object', 'object')
      .replace('Array', 'any[]')
  }
}

main()

/**
 * Convert text to kebab-case
 * @param {string} str Text to be converted
 * @return {string}
 */
function kebabCase (str) {
  return str
    .replace(/_/gu, '-')
    .replace(/\B([A-Z])/gu, '-$1')
    .toLowerCase()
}

/**
 * Convert text to camelCase
 * @param {string} str Text to be converted
 * @return {string} Converted string
 */
function camelCase (str) {
  return str.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ''))
}

/**
 * Convert text to PascalCase
 * @param {string} str Text to be converted
 * @return {string} Converted string
 */
function pascalCase (str) {
  return capitalize(camelCase(str))
}

/**
 * Capitalize a string.
 * @param {string} str
 */
function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

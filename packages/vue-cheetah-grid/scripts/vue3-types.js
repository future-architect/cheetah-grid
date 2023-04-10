const fs = require('fs')
const path = require('path')
const { getAllVueComponentMetadata, getPropType, isRequiredProp } = require('./lib/metadata')
const cheetahGrid = require('cheetah-grid')
const { EVENT_TYPE } = cheetahGrid.ListGrid
const vue3Emits = Object.keys(EVENT_TYPE)
  .map(k => EVENT_TYPE[k].replace(/_/g, '-').toLowerCase())
  .reduce((r, v) => {
    r[v] = null
    return r
  }, {})

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
    const emits = Object.keys(vue3Emits).map(emitName => {
      return `
on${pascalCase(emitName)}?: Function;
`.trim()
    })
    componentTypes.push(`
/** ${component.description} */
export type ${componentName} = GlobalComponentConstructor<{
${indent([...props, ...emits].join('\n'), 2)}
}>;
`.trim())
    components.push(`
/** ${component.description} */
${componentName}: ${componentName};
"${kebabCase(componentName)}": ${componentName};
`.trim())
  }

  const typePath = path.resolve(path.join(__dirname, '../types/vue3.d.ts'))
  const typeDir = path.dirname(typePath)
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir)
  }
  fs.writeFileSync(typePath, `${`
import { VNodeProps, AllowedComponentProps, ComponentCustomProps } from "@vue/runtime-core";
// type VueInstance = ComponentPublicInstance

/* @see https://unpkg.com/browse/quasar@2.7.3/dist/types/ts-helpers.d.ts */
// https://github.com/vuejs/vue-next/blob/d84d5ecdbdf709570122175d6565bb61fae877f2/packages/runtime-core/src/apiDefineComponent.ts#L29-L31
// TODO: This can be imported from vue directly once this PR gets merged: https://github.com/vuejs/vue-next/pull/2403
type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps;

// Can't use \`DefineComponent\` because of the false prop inferring behavior, it doesn't pick up the required types when an interface is passed
// This PR will probably solve the problem as it moves the prop inferring behavior to \`defineComponent\` function: https://github.com/vuejs/vue-next/pull/4465
// GlobalComponentConstructor helper is kind of like the ComponentConstructor type helper, but simpler and keeps the Volar errors simpler,
// and also similar to the usage in official Vue packages: https://github.com/vuejs/vue-next/blob/d84d5ecdbdf709570122175d6565bb61fae877f2/packages/runtime-core/src/components/BaseTransition.ts#L258-L264 or https://github.com/vuejs/vue-router-next/blob/5dd5f47515186ce34efb9118dda5aad0bb773439/src/RouterView.ts#L160-L172 etc.
// TODO: This can be replaced with \`DefineComponent\` once this PR gets merged: https://github.com/vuejs/vue-next/pull/4465
type GlobalComponentConstructor<Props = {}, Slots = {}> = {
  new (): {
    $props: PublicProps & Props
    $slots: Slots
  }
}

${componentTypes.join('\n')}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
${indent(components.join('\n'), 4)}
  }
}

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

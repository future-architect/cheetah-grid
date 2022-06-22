const fs = require('fs')
const path = require('path')
const { getAllVueComponentMetadata, getPropType } = require('./lib/metadata')

async function main () {
  const allMetadata = await getAllVueComponentMetadata()

  const components = []

  for (const { component, componentName, filename } of Object.values(allMetadata)) {
    if (filename.includes('/c-grid/')) continue
    const props = component.props.map(prop => {
      return `
/** ${prop.description} */
${camelCase(prop.name)}: ${normalizePropType(prop)};
`.trim()
    })
    components.push(`
/** ${component.description} */
${componentName}: DefineComponent<{
${indent(props.join('\n'), 2)}
}>
`.trim())
  }

  const typePath = path.resolve(path.join(__dirname, '../types/vue3.d.ts'))
  const typeDir = path.dirname(typePath)
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir)
  }
  fs.writeFileSync(typePath, `${`
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
${indent(components.join('\n'), 4)}
  }
}
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

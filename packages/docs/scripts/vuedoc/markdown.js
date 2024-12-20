const { getPropType } = require('../../../vue-cheetah-grid/scripts/lib/metadata')
const path = require('path')

function createHeader (componentName, comp) {
  return `---
sidebarDepth: 3
---

# ${componentName}

${unindent(comp.description)}
`
}

function createSlot (slot) {
  return `
### \`${slot.name}\` slot

${unindent(slot.description)}
`
}

function createProps (comp) {
  const reqProps = []
  const optProps = []

  for (const prop of comp.props) {
    // const defaultValue = prop.value.default

    const type = getPropType(prop)
    const list = prop.value.required ? reqProps : optProps
    const defaultKeyword = prop.keywords.find(({ name, description }) => name === 'default' && description)
    const defaultValue = defaultKeyword
      ? defaultKeyword.description
      // eslint-disable-next-line no-prototype-builtins
      : prop.value.hasOwnProperty('default')
        ? parseValue(prop.value.default)
        : undefined
    const typeMd = parseType(type)
      .replace(/\|/g, '&#124;')
      .replace('`Number`', '`number`')
      .replace('`String`', '`string`')
      .replace('`Boolean`', '`boolean`')
      .replace('`Function`', '`function`')
      .replace('`Object`', '`object`')
    const deprecatedKeyword = prop.keywords.find(({ name }) => name === 'deprecated')
    if (deprecatedKeyword) {
      list.push(`| ${prop.name} | ${typeMd}  | DEPRECATED! ${deprecatedKeyword.description} ${prop.description.replace(/\r?\n/g, '<br>')} | \`${defaultValue}\` |`)
      continue
    }

    list.push(`| ${prop.name} | ${typeMd}  | ${prop.description.replace(/\r?\n/g, '<br>')} | \`${defaultValue}\` |`)
  }

  let md = ''
  if (reqProps.length) {
    md += `
### Required Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
${reqProps.join('\n')}
`
  }
  if (optProps.length) {
    md += `
### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
${optProps.join('\n')}
`
  }
  return md
}

function createData (comp) {
  const dataTable = []
  for (const data of comp.data) {
    if (data.description) {
      const typeKeyword = data.keywords.find(k => k.name === 'type')
      const type = (typeKeyword && typeKeyword.description.replace(/\{(.+?)\}/, '$1')) || '---'

      let init = JSON.stringify(data.value)
      if (data.value && data.value.type) {
        if (data.value.type === 'NewExpression' && data.value.callee.type === 'Identifier') {
          init = `new ${data.value.callee.name}()`
        } else {
          init = '?'
        }
      } else {
        init = JSON.stringify(data.value)
      }

      dataTable.push(`| ${data.name} | ${type} | \`${init}\` | ${data.description.replace(/\r?\n/g, '<br>')} |`)
    }
  }
  const md = `
| Name        | Type | Initial Value | Description         |
|:------------|:-----|:--------------|:--------------------|
${dataTable.join('\n')}
`
  return md
}

function createEvents (comp) {
  const events = []
  for (const event of comp.events) {
    if (event.description) {
      events.push(`| ${event.name} | ${event.description.replace(/\r?\n/g, '<br>')} |`)
    }
  }
  const md = `
| Name        | Description         |
|:------------|:--------------------|
${events.join('\n')}
`
  return md
}

function createMethods (comp) {
  const methods = []
  for (const method of comp.methods) {
    const r = /\{(.+)\}/.exec(method.return.desc)
    const type = (r ? r[1] : '---').replace(/^void$/i, '---')

    methods.push(`| ${method.name} | ${type} | ${method.description.replace(/\r?\n/g, '<br>')} |`)
  }
  const md = `
| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
${methods.join('\n')}
`
  return md
}

module.exports = {
  render (context, comp, contents) {
    // header
    const header = createHeader(context.componentName, comp)
    contents = replaceOrAppend(contents, /^([\s\S]*?)\n##/, `${header}\n##`, s => header + s)

    // slots
    if (comp.slots.length) {
      contents = replaceOrAppend(contents, /\n##\s*Slots\s*/i, '\n## Slots\n\n')
      for (const slot of comp.slots) {
        contents = replaceBlock(contents, `<!-- SLOT_${slot.name}_START -->`, `<!-- SLOT_${slot.name}_END -->`, createSlot(slot))
      }
    }

    // props
    if (comp.props.length) {
      contents = replaceOrAppend(contents, /\n##\s*Prop(ertie)?s\s*/i, '\n## Properties\n\n')
      contents = replaceBlock(contents, '<!-- PROPS_TABLE_START -->', '<!-- PROPS_TABLE_END -->', createProps(comp))
    }

    // data
    if (comp.data.some(d => d.description)) {
      contents = replaceOrAppend(contents, /\n##\s*Data\s*/i, '\n## Data\n\n')
      contents = replaceBlock(contents, '<!-- DATA_TABLE_START -->', '<!-- DATA_TABLE_END -->', createData(comp))
    }

    // events
    if (comp.events.length) {
      contents = replaceOrAppend(contents, /\n##\s*Events\s*/i, '\n## Events\n\n')
      contents = replaceBlock(contents, '<!-- EVENTS_TABLE_START -->', '<!-- EVENTS_TABLE_END -->', createEvents(comp))
    }

    // methods
    if (comp.methods.length) {
      contents = replaceOrAppend(contents, /\n##\s*Methods\s*/i, '\n## Methods\n\n')
      contents = replaceBlock(contents, '<!-- METHODS_TABLE_START -->', '<!-- METHODS_TABLE_END -->', createMethods(comp))
    }

    return contents.replace(/\n{3,}/g, '\n\n').replace(/\n{2,}$/g, '\n')
      .replace(/\((https:\/\/future-architect\.github\.io\/cheetah-grid\/documents\/.*?)\)/gu, (_, match) => {
        const url = new URL(match)
        let linkPathname = url.pathname.slice(23)
        if (linkPathname.endsWith('/')) {
          linkPathname += 'index.md'
        } else if (linkPathname.endsWith('.html')) {
          linkPathname = `${linkPathname.slice(0, -5)}.md`
        }
        const linkPath = path.join(__dirname, '../..', linkPathname)

        const replaced = path.relative(path.dirname(context.fileName), linkPath) + (url.hash || '')
        return `(${replaced})`
      })
  }
}

function replaceOrAppend (s, re, newStr, replacer) {
  const r = re.exec(s)
  if (r) {
    re.lastIndex = 0
    return s.replace(re, newStr)
  }
  if (replacer) {
    return replacer(s, newStr)
  }
  return s + newStr
}

function replaceBlock (s, start, end, contents) {
  start = start.toUpperCase()
  end = end.toUpperCase()
  return replaceOrAppend(s, new RegExp(`\n${start}([\\s\\S]*?)${end}`, 'i'), `\n${start}\n${contents}\n${end}\n`)
}

function parseValue (value) {
  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false'

    case 'string':
      value = value.replace(/'/g, '\'')
      return `'${value}'`

    case 'undefined':
      return 'undefined'

    default:
      if (value === null) {
        return 'null'
      }
  }

  return value
}
function parseType (type) {
  if (Array.isArray(type)) {
    return type.map(t => `\`${t}\``).join('|')
  }
  return `\`${type}\``
}

/**
 * @param {string} str string
 */
function unindent (str) {
  const lines = str.split(/\r?\n/g)

  return lines
    .map((line, i) => line.replace(/^\s+/, '') + (i === lines.length - 1 ? '' : '  '))
    .join('\n')
}

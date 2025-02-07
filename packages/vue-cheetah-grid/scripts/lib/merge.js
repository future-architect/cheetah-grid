
module.exports = {
  merge (components) {
    if (components.length <= 1) {
      return components[0]
    }

    const merge = require('deepmerge')
    const c = merge.all(components)
    c.props = mergeProps(components)
    c.methods = mergeMethods(components)
    return c
  }
}

const PROPS = [
  'field',
  'width',
  'min-width',
  'max-width',
  'column-type',
  'column-style',
  'action',
  'caption',
  'disabled',
  'readonly'
]

function mergeProps (components) {
  const props = components.flatMap(c => c.props)
  const mergedProps = []
  for (const prop of props) {
    const idx = mergedProps.findIndex((t) => t.name === prop.name)
    if (idx >= 0) {
      mergedProps.splice(idx, 1)
    }
    mergedProps.push(prop)
  }
  mergedProps.sort((a, b) => {
    const ai = PROPS.indexOf(a.name)
    const bi = PROPS.indexOf(b.name)
    if (ai >= 0 && bi >= 0) {
      return compare(ai, bi)
    }
    if (ai >= 0) {
      return -1
    }
    if (bi >= 0) {
      return 1
    }
    return compare(a.name, b.name)
  })

  return mergedProps
}

function mergeMethods (components) {
  const methods = components.flatMap(c => c.methods)
  const mergedMethods = []
  for (const method of methods) {
    const idx = mergedMethods.findIndex((t) => t.name === method.name)
    if (idx >= 0) {
      mergedMethods.splice(idx, 1)
    }
    mergedMethods.push(method)
  }
  mergedMethods.sort((a, b) => {
    return compare(a.name, b.name)
  })

  return mergedMethods
}

function compare (a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}

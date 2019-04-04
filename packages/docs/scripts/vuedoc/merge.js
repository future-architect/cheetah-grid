
module.exports = {
  merge (components) {
    if (components.length <= 1) {
      return components[0]
    }

    const merge = require('deepmerge')
    const c = merge.all(components)
    c.props = mergeProps(components)
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
  const propss = components.map(c => c.props)
  const mergeProps = []
  for (const props of propss) {
    for (const prop of props) {
      const idx = mergeProps.findIndex((t) => t.name === prop.name)
      if (idx >= 0) {
        mergeProps.splice(idx, 1)
      }
      mergeProps.push(prop)
    }
  }
  mergeProps.sort((a, b) => {
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

  return mergeProps
}

function compare (a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}

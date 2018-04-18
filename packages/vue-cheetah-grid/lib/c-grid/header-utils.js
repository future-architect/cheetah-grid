/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase()

function vnodeToColumn (vnode) {
  if (vnode.componentInstance &&
    vnode.componentOptions &&
    hyphenate(vnode.componentOptions.tag).startsWith('c-grid') &&
    typeof vnode.componentInstance.createColumn === 'function') {
    return vnode.componentInstance.createColumn()
  }

  throw new Error(`unknown tag: ${vnode.tag}`)
}
function vnodeToColumnProp (vnode) {
  if (vnode.componentInstance &&
    vnode.componentOptions &&
    hyphenate(vnode.componentOptions.tag).startsWith('c-grid') &&
    typeof vnode.componentInstance.createColumn === 'function') {
    return vnode.componentInstance.$_CGridColumn_getProps()
  }

  throw new Error(`unknown tag: ${vnode.tag}`)
}
function filterHeaderElements (slots) {
  return slots ? slots.filter(vnode => !!vnode.tag) : []
}
export function slotsToHeaderOptions (slots) {
  return filterHeaderElements(slots).map(vnode => vnodeToColumn(vnode))
}

export function slotsToHeaderProps (slots) {
  return filterHeaderElements(slots).map(vnode => vnodeToColumnProp(vnode))
}

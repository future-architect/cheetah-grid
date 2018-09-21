/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase()

function vnodeToColumn (vnode) {
  if (!vnode.componentOptions ||
    hyphenate(vnode.componentOptions.tag).indexOf('c-grid') !== 0) {
    throw new Error(`unknown tag: ${(vnode.componentOptions && vnode.componentOptions.tag) || vnode.tag}`)
  }
  if (vnode.componentInstance &&
    typeof vnode.componentInstance.createColumn === 'function') {
    return vnode.componentInstance.createColumn()
  }
  // before instantiation?
  return undefined
}
function vnodeToColumnProp (vnode) {
  if (!vnode.componentOptions ||
    hyphenate(vnode.componentOptions.tag).indexOf('c-grid') !== 0) {
    throw new Error(`unknown tag: ${(vnode.componentOptions && vnode.componentOptions.tag) || vnode.tag}`)
  }
  if (vnode.componentInstance &&
    typeof vnode.componentInstance.createColumn === 'function') {
    return vnode.componentInstance.$_CGridColumn_getProps()
  }
  // before instantiation?
  return undefined
}
function filterHeaderElements (slots) {
  return slots ? slots.filter(vnode => !!vnode.tag) : []
}
export function slotsToHeaderOptions (slots) {
  return filterHeaderElements(slots).map(vnode => vnodeToColumn(vnode)).filter(c => c)
}

export function slotsToHeaderProps (slots) {
  return filterHeaderElements(slots).map(vnode => vnodeToColumnProp(vnode)).filter(p => p)
}

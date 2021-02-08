const map = new WeakMap()

export function storeElement (vm) {
  map.set(vm.$el, vm)
}
export function removeElement (vm) {
  map.delete(vm.$el)
}
export function getComponentFromElement (element) {
  return map.get(element)
}

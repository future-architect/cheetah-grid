import * as cheetahGrid from 'cheetah-grid'

export { cheetahGrid }

function isDef (data) {
  return data !== null && typeof data !== 'undefined'
}
const isPromise = (data) => data && typeof data.then === 'function'
export function isObject (obj) {
  return obj === Object(obj)
}
function applyChainSafe (obj, fn, ...names) {
  let value = obj
  for (let i = 0; i < names.length && isDef(value); i++) {
    value = fn(value, names[i])
  }
  return value
}

export function getField (record, field) {
  if (!isDef(record)) {
    return undefined
  }
  if (isPromise(record)) {
    return record.then((r) => getField(r, field))
  }
  if (field in record) {
    return record[field]
  }
  if (typeof field === 'function') {
    return field(record)
  }
  const ss = (`${field}`).split('.')
  if (ss.length <= 1) {
    return record[field]
  }
  return applyChainSafe(record, (val, name) => getField(val, name), ...ss)
}
function applyFilter (val, filterFn) {
  if (isPromise(val)) {
    return val.then(filterFn)
  }
  return filterFn(val)
}

export function filterToFn (instance, field, filter) {
  if (isObject(field) && field.get && field.set) {
    return {
      get: filterToFn(instance, field.get, filter),
      set: field.set
    }
  }
  if (typeof filter === 'function') {
    return (rec) => applyFilter(getField(rec, field), filter)
  }
  const Vue = instance.constructor
  const maybeV2 = Vue && Vue.filter
  if (!maybeV2) {
    return (rec) => applyFilter(getField(rec, field), filter)
  }
  // maybe Vue v2
  filter = filter.trim()
  const i = filter.indexOf('(')
  if (i < 0) {
    return (rec) => {
      return applyFilter(getField(rec, field), Vue.filter(filter))
    }
  } else {
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1, filter.length - 1)
    const props = Function(`with(this){return [${args}]}`).call(instance.$vnode.context) // eslint-disable-line no-new-func
    return (rec) => {
      return applyFilter(getField(rec, field), (v) => Vue.filter(name)(v, ...props))
    }
  }
}

export function normalizeColumnType (columnType) {
  if (columnType && typeof columnType !== 'string') {
    if (typeof columnType === 'function') {
      columnType = columnType()
    }
    if (typeof columnType.typeName === 'string') {
      columnType = new cheetahGrid.columns.type[columnType.typeName](columnType.option)
    }
  }
  return columnType
}
export function normalizeAction (action) {
  if (action && typeof action !== 'string') {
    if (typeof action === 'function') {
      action = new cheetahGrid.columns.action.Action({
        action
      })
    } else if (typeof action.actionName === 'string') {
      action = new cheetahGrid.columns.action[action.actionName](action.option)
    }
  }
  return action
}

export const gridUpdateWatcher = {
  handler () {
    this.$_CGrid_nextTickUpdate()
  },
  deep: true
}

export function extend (...objects) {
  const result = {}
  objects.forEach((obj) => {
    for (const key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}
export function resolveProxyComputedProps (propName) {
  return function () {
    const vm = this
    const proxyName = `$_CGridColumn_${propName}Proxy`
    const prop = vm[propName]
    return typeof prop === 'function' ? vm[proxyName] : prop
  }
}

export function resolveProxyPropsMethod (propName) {
  return function (...args) {
    const vm = this
    const prop = vm[propName]

    return typeof prop === 'function' ? prop(...args) : undefined
  }
}

/**
 * @param {VueInstance} vm
 * @param {string} name
 * @returns {HTMLCollection}
 */
export function getSlotChildren (vm, name = 'defaultSlotContainer') {
  /** @type {HTMLElement} */
  const el = vm.$refs[name]
  const list = el.children
  return list[0] ? list : null
}

// for compatibility
const { EVENT_TYPE } = cheetahGrid.ListGrid
export const vue3Emits = Object.keys(EVENT_TYPE)
  .map(k => EVENT_TYPE[k].replace(/_/g, '-').toLowerCase())
  .reduce((r, v) => {
    r[v] = null
    return r
  }, {})

export function hackVue3 (options) {
  // eslint-disable-next-line no-undef
  if ((typeof __VUE_OPTIONS_API__ !== 'undefined' && __VUE_OPTIONS_API__) ||
    // eslint-disable-next-line no-undef
    (typeof Vue !== 'undefined' && `${Vue.version}`.startsWith('3'))) {
    delete options.beforeDestroy
    delete options.destroyed
  }
}

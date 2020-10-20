import { getSlotChildren } from './utils'

export function slotElementsToHeaderOptions (cgridVm, childrenOrName) {
  return getHeaderInstances(cgridVm, childrenOrName)
    .map(instance => instance.createColumn())
    .filter(c => c)
}

export function slotElementsToHeaderProps (cgridVm, childrenOrName) {
  return getHeaderInstances(cgridVm, childrenOrName)
    .map(instance => instance.getPropsObjectInternal())
    .filter(p => p)
}

function getHeaderInstances (cgridVm, childrenOrName) {
  const elements = typeof childrenOrName === 'string' ? getSlotChildren(cgridVm, childrenOrName) : childrenOrName

  return elements ? getColumnDefinesFromElements(cgridVm, elements) : []
}

/**
 * @param {VueInstance} cgridVm
 * @param {HTMLCollection} elements
 */
function getColumnDefinesFromElements (cgridVm, elements, colsMap) {
  const results = []
  if (!colsMap) {
    colsMap = new Map()
    cgridVm.$_CGrid_defineColumns.forEach(col => {
      colsMap.set(col.$el, col)
    })
  }
  for (let index = 0; index < elements.length; index++) {
    const el = elements[index]
    if (!el) {
      continue
    }
    const col = colsMap.get(el)
    if (col && typeof col.createColumn === 'function') {
      results.push(col)
    } else {
      const { children } = el
      results.push(...getColumnDefinesFromElements(cgridVm, children, colsMap))
    }
  }

  return results
}

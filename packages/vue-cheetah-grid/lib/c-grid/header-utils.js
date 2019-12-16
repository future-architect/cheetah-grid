
export function slotsToHeaderOptions (cgridVm, slots) {
  return getHeaderInstances(cgridVm, slots)
    .map(instance => instance.createColumn())
    .filter(c => c)
}

export function slotsToHeaderProps (cgridVm, slots) {
  return getHeaderInstances(cgridVm, slots)
    .map(instance => instance.getPropsObjectInternal())
    .filter(p => p)
}

function getHeaderInstances (cgridVm, slots) {
  return slots ? getColumnDefines(cgridVm, slots) : []
}

function getColumnDefines (cgridVm, vnodes) {
  const results = []
  vnodes.forEach(vnode => {
    if (!vnode.tag) {
      return
    }
    if (!vnode.componentInstance) {
      return
    }
    if (typeof vnode.componentInstance.createColumn === 'function') {
      const defineColumns = cgridVm.$_CGrid_defineColumns
      if (defineColumns.indexOf(vnode.componentInstance) >= 0) {
        results.push(vnode.componentInstance)
        return
      }
    }
    results.push(...getColumnDefines(cgridVm, vnode.componentInstance.$children))
  })

  return results
}


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
  return slots ? getColumnDefinesFromVNodes(cgridVm, slots) : []
}

function getColumnDefinesFromVNodes (cgridVm, vnodes) {
  return getColumnDefinesFromInstances(vnodes.map(vnode => {
    if (!vnode.tag) {
      return null
    }
    if (!vnode.componentInstance) {
      return null
    }
    return vnode.componentInstance
  }))
}

function getColumnDefinesFromInstances (cgridVm, instances) {
  const results = []
  instances.forEach(componentInstance => {
    if (!componentInstance) {
      return
    }
    if (typeof componentInstance.createColumn === 'function') {
      const defineColumns = cgridVm.$_CGrid_defineColumns
      if (defineColumns.indexOf(componentInstance) >= 0) {
        results.push(componentInstance)
        return
      }
    }
    results.push(...getColumnDefinesFromInstances(cgridVm, componentInstance.$children))
  })

  return results
}

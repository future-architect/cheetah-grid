
import CGrid from './CGrid.vue'
import CGridColumn from './CGridColumn.vue'
import CGridColumnGroup from './CGridColumnGroup.vue'
import CGridButtonColumn from './CGridButtonColumn.vue'
import CGridPercentCompleteBarColumn from './CGridPercentCompleteBarColumn.vue'
import CGridIconColumn from './CGridIconColumn.vue'
import CGridInputColumn from './CGridInputColumn.vue'
import CGridLinkColumn from './CGridLinkColumn.vue'
import CGridMenuColumn from './CGridMenuColumn.vue'

export {CGrid, CGridColumn, CGridButtonColumn, CGridPercentCompleteBarColumn, CGridIconColumn, CGridColumnGroup, CGridInputColumn, CGridLinkColumn, CGridMenuColumn}

export default CGrid

export function install (Vue) {
  const components = {CGrid, CGridColumn, CGridButtonColumn, CGridPercentCompleteBarColumn, CGridIconColumn, CGridColumnGroup, CGridInputColumn, CGridLinkColumn, CGridMenuColumn}
  for (const name in components) {
    Vue.component(name, components[name])
  }
}

CGrid.install = install

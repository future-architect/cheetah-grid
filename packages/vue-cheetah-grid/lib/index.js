
import { cheetahGrid } from './c-grid/utils'
import CGrid from './CGrid.vue'
import CGridColumn from './CGridColumn.vue'
import CGridColumnGroup from './CGridColumnGroup.vue'
import CGridButtonColumn from './CGridButtonColumn.vue'
import CGridCheckColumn from './CGridCheckColumn.vue'
import CGridPercentCompleteBarColumn from './CGridPercentCompleteBarColumn.vue'
import CGridIconColumn from './CGridIconColumn.vue'
import CGridInputColumn from './CGridInputColumn.vue'
import CGridLinkColumn from './CGridLinkColumn.vue'
import CGridMenuColumn from './CGridMenuColumn.vue'
import CGridRadioColumn from './CGridRadioColumn.vue'
import CGridBranchGraphColumn from './CGridBranchGraphColumn.vue'
import CGridTreeColumn from './CGridTreeColumn.vue'

import CGridLayoutRow from './CGridLayoutRow.vue'
import CGridHeader from './CGridHeader.vue'

export * from './c-grid/elements'

export {
  CGrid,
  CGridColumn,
  CGridColumnGroup,
  CGridCheckColumn,
  CGridButtonColumn,
  CGridPercentCompleteBarColumn,
  CGridIconColumn,
  CGridInputColumn,
  CGridLinkColumn,
  CGridMenuColumn,
  CGridRadioColumn,
  CGridBranchGraphColumn,
  CGridTreeColumn,
  CGridLayoutRow,
  CGridHeader,
  cheetahGrid
}

export default CGrid

export function install (Vue) {
  const components = {
    CGrid,
    CGridColumn,
    CGridColumnGroup,
    CGridCheckColumn,
    CGridButtonColumn,
    CGridPercentCompleteBarColumn,
    CGridIconColumn,
    CGridInputColumn,
    CGridLinkColumn,
    CGridMenuColumn,
    CGridRadioColumn,
    CGridBranchGraphColumn,
    CGridTreeColumn,
    CGridLayoutRow,
    CGridHeader
  }
  for (const name in components) {
    Vue.component(name, components[name])
  }
}

CGrid.install = install

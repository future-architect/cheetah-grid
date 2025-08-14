<template>
  <div
    ref="defaultSlotContainer"
    class="c-grid-layout-row"
  >
    <!-- Use this slot to set the row layout definition -->
    <slot />
  </div>
</template>

<script>
import { slotElementsToHeaderOptions, slotElementsToHeaderProps } from './c-grid/header-utils'
import { getSlotChildren } from './c-grid/utils'
import { storeElement, removeElement } from './c-grid/elements'

/**
 * Defines layout row.
 * Can be used in the `layout-header` slot and the `layout-body` slot of `CGrid`.
 */
export default {
  name: 'CGridLayoutRow',
  inject: ['$_CGridInstance'],
  mounted () {
    storeElement(this)
    this.$_CGridInstance.$_CGrid_setColumnDefine(this)
    this.$_CGrid_nextTickUpdate()
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  beforeUnmount () {
    const vm = this
    removeElement(vm)
    vm.$_CGridInstance.$_CGrid_removeColumnDefine(vm)
  },
  methods: {
    /**
     * @private
     */
    getPropsObjectInternal () {
      return slotElementsToHeaderProps(this.$_CGridInstance, getSlotChildren(this))
    },
    /**
     * @private
     */
    createColumn () {
      return slotElementsToHeaderOptions(this.$_CGridInstance, getSlotChildren(this))
    },
    /**
     * @private
     */
    $_CGrid_nextTickUpdate () {
      if (this.$_CGridInstance && this.$_CGridInstance.$_CGrid_nextTickUpdate) {
        this.$_CGridInstance.$_CGrid_nextTickUpdate()
      }
    }
  }
}
</script>

<style scoped>
.c-grid-layout-row {
  display: none;
}
</style>

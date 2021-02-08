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
import { getSlotChildren, hackVue3 } from './c-grid/utils'
import { storeElement, removeElement } from './c-grid/elements'

/**
 * Defines layout row.
 * Can be used in the `layout-header` slot and the `layout-body` slot of `CGrid`.
 */
export default {
  name: 'CGridLayoutRow',
  get mixins () {
    hackVue3(this)
    return undefined
  },
  inject: ['$_CGridInstance'],
  mounted () {
    storeElement(this)
    this.$_CGridInstance.$_CGrid_setColumnDefine(this)
    this.$_CGrid_nextTickUpdate()
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  // for Vue 3
  beforeUnmount () {
    beforeDestroy(this)
  },
  // for Vue 2
  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  beforeDestroy () {
    beforeDestroy(this)
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

function beforeDestroy (vm) {
  removeElement(vm)
  vm.$_CGridInstance.$_CGrid_removeColumnDefine(vm)
}
</script>

<style scoped>
.c-grid-layout-row {
  display: none;
}
</style>

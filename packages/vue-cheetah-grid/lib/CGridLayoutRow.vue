<template>
  <div class="c-grid-layout-row">
    <!-- Use this slot to set the children layout definition -->
    <slot />
  </div>
</template>

<script>
import { slotsToHeaderOptions, slotsToHeaderProps } from './c-grid/header-utils'

/**
 * Defines layout row.
 */
export default {
  inject: ['$_CGridInstance'],
  name: 'CGridLayoutRow',
  mounted () {
    this.$_CGridInstance.$_CGrid_setColumnDefine(this)
    this.$_CGrid_nextTickUpdate()
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  beforeDestroy () {
    this.$_CGridInstance.$_CGrid_removeColumnDefine(this)
  },
  methods: {
    /**
     * @private
     */
    getPropsObjectInternal () {
      return slotsToHeaderProps(this.$_CGridInstance, this.$slots.default)
    },
    /**
     * @private
     */
    createColumn () {
      return slotsToHeaderOptions(this.$_CGridInstance, this.$slots.default)
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

<template>
  <div
    ref="defaultSlotContainer"
    class="c-grid-column-group"
  >
    <!-- Use this slot to set the children columns definition -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import { slotElementsToHeaderOptions, slotElementsToHeaderProps } from './c-grid/header-utils'
import { extend, getSlotChildren } from './c-grid/utils'

/**
 * Defines multiple header.
 * Can be used in the `default` slot of `CGrid`.
 * @mixin column-mixin
 */
export default {
  name: 'CGridColumnGroup',
  mixins: [ColumnMixin],
  props: {
  },
  methods: {
    /**
     * @private
     * @override
     */
    getPropsObjectInternal () {
      const props = ColumnMixin.methods.getPropsObjectInternal.apply(this)
      props.columns = slotElementsToHeaderProps(this.$_CGridInstance, getSlotChildren(this))
      return props
    },
    /**
     * @private
     */
    createColumn () {
      const baseCol = ColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        {
          columns: slotElementsToHeaderOptions(this.$_CGridInstance, getSlotChildren(this))
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-column-group {
  display: none;
}
</style>

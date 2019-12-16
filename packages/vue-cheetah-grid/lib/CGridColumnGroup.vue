<template>
  <div class="c-grid-column-group">
    <!-- Use this slot to set the children columns definition -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import { slotsToHeaderOptions, slotsToHeaderProps } from './c-grid/header-utils'
import { extend } from './c-grid/utils'

/**
 * Defines multiple header.
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
      props.columns = slotsToHeaderProps(this.$_CGridInstance, this.$slots.default)
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
          columns: slotsToHeaderOptions(this.$_CGridInstance, this.$slots.default)
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

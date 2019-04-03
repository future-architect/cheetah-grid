<template>
  <!-- Use this slot to set the children columns definition -->
  <div class="c-grid-column-group">
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import { slotsToHeaderOptions, slotsToHeaderProps } from './c-grid/header-utils'

/**
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
      props.columns = slotsToHeaderProps(this.$slots.default)
      return props
    },
    /**
     * @private
     */
    createColumn () {
      return {
        vm: this,
        caption: this.caption,
        headerStyle: this.headerStyle,
        headerField: this.headerField,
        headerType: this.headerType,
        headerAction: this.headerAction,
        sort: this.sort,
        columns: slotsToHeaderOptions(this.$slots.default)
      }
    }
  }
}
</script>

<style scoped>
.c-grid-column-group {
  display: none;
}
</style>

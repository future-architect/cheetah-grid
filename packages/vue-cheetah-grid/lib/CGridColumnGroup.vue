<template>
  <!-- Use this slot to set the children columns definition -->
  <div class="c-grid-column-group"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import { slotsToHeaderOptions } from './c-grid/header-utils'

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
     */
    createColumn () {
      return {
        caption: this.caption,
        headerStyle: this.headerStyle,
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

<template>
  <div class="c-grid-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { extend, normalizeColumnType, normalizeAction, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines column.
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a column type
     */
    columnType: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines an action
     */
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  watch: {
    columnType: gridUpdateWatcher,
    action: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const columnType = normalizeColumnType(this.columnType)
      const action = normalizeAction(this.action)
      const baseCol = ColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          caption: this.caption || this.$el.textContent.trim(),
          columnType,
          action
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-column {
  display: none;
}
</style>

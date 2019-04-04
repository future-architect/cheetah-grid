<template>
  <div class="c-grid-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { filterToFn, normalizeColumnType, normalizeAction, gridUpdateWatcher } from './c-grid/utils'

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
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
        vm: this,
        caption: this.caption || this.$el.textContent.trim(),
        headerStyle: this.headerStyle,
        headerField: this.headerField,
        headerType: this.headerType,
        headerAction: this.headerAction,
        field,
        columnType,
        width: this.width,
        minWidth: this.minWidth,
        maxWidth: this.maxWidth,
        action,
        style: this.columnStyle,
        sort: this.sort,
        icon: this.icon,
        message: this.message
      }
    }
  }
}
</script>

<style scoped>
.c-grid-column {
  display: none;
}
</style>

<template>
  <div class="c-grid-percent-complete-bar-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, normalizeAction, filterToFn, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines percent complete bar column.
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridPercentCompleteBarColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a formatter
     */
    formatter: {
      type: [Function],
      default: undefined
    },
    /**
     * Defines a min value
     */
    min: {
      type: [Number, String],
      default: undefined
    },
    /**
     * Defines a max value
     */
    max: {
      type: [Number, String],
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
    formatter: gridUpdateWatcher,
    min: gridUpdateWatcher,
    max: gridUpdateWatcher,
    action: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const columnType = new cheetahGrid.columns.type.PercentCompleteBarColumn({
        min: this.min,
        max: this.max,
        formatter: this.formatter
      })
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
.c-grid-percent-complete-bar-column {
  display: none;
}
</style>

<template>
  <div class="c-grid-percent-complete-bar-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, normalizeAction, extend, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines percent complete bar column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridPercentCompleteBarColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
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

      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
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
.c-grid-percent-complete-bar-column {
  display: none;
}
</style>

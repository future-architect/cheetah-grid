<template>
  <div class="c-grid-percent-complete-bar-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, normalizeAction, extend, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

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
  computed: {
    resolvedFormatter: resolveProxyComputedProps('formatter'),
    resolvedAction: resolveProxyComputedProps('action')
  },
  watch: {
    resolvedFormatter: gridUpdateWatcher,
    min: gridUpdateWatcher,
    max: gridUpdateWatcher,
    resolvedAction: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     * @override
     */
    getPropsObjectInternal () {
      const baseCol = LayoutColumnMixin.methods.getPropsObjectInternal.apply(this)
      const stdCol = StdColumnMixin.methods.getPropsObjectInternal.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          min: this.min,
          max: this.max,
          formatter: this.resolvedFormatter,

          action: this.resolvedAction
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const columnType = new cheetahGrid.columns.type.PercentCompleteBarColumn({
        min: this.min,
        max: this.max,
        formatter: this.resolvedFormatter
      })
      const action = normalizeAction(this.resolvedAction)

      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          columnType,
          action
        }
      )
    },

    /**
     * @private
     */
    $_CGridColumn_formatterProxy: resolveProxyPropsMethod('formatter'),
    /**
     * @private
     */
    $_CGridColumn_actionProxy: resolveProxyPropsMethod('action')
  }
}
</script>

<style scoped>
.c-grid-percent-complete-bar-column {
  display: none;
}
</style>

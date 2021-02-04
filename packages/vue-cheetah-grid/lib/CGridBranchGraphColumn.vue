<template>
  <div class="c-grid-branch-graph-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, normalizeAction, extend, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

/**
 * Defines branch graph column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridBranchGraphColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a start type
     */
    start: {
      type: String,
      default: undefined,
      validator (value) {
        return value == null || value === 'top' || value === 'bottom'
      }
    },
    /**
     * Enable cache
     */
    cache: {
      type: Boolean
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
    resolvedAction: resolveProxyComputedProps('action')
  },
  watch: {
    start: gridUpdateWatcher,
    cache: gridUpdateWatcher,
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
          start: this.start,
          cache: this.cache,

          action: this.resolvedAction
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const columnType = new cheetahGrid.columns.type.BranchGraphColumn({
        start: this.start,
        cache: this.cache
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
    $_CGridColumn_actionProxy: resolveProxyPropsMethod('action')
  }
}
</script>

<style scoped>
.c-grid-branch-graph-column {
  display: none;
}
</style>

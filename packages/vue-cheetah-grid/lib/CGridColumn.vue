<template>
  <div class="c-grid-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { extend, normalizeColumnType, normalizeAction, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

/**
 * Defines column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
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
  computed: {
    resolvedAction: resolveProxyComputedProps('action')
  },
  watch: {
    columnType: gridUpdateWatcher,
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
          columnType: this.columnType,
          action: this.resolvedAction
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const columnType = normalizeColumnType(this.columnType)
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
.c-grid-column {
  display: none;
}
</style>

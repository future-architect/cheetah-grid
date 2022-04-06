<template>
  <div class="c-grid-link-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend, normalizeColumnType, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

/**
 * Defines link column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridLinkColumn',
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
     * Defines a href
     */
    href: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an anchor target
     */
    target: {
      type: [String],
      default: undefined
    },
    /**
     * Defines disabled. You can also control each record by specifying a function.
     */
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  computed: {
    resolvedHref: resolveProxyComputedProps('href')
  },
  watch: {
    columnType: gridUpdateWatcher,
    resolvedHref: gridUpdateWatcher,
    target: gridUpdateWatcher,
    disabled (disabled) {
      if (this._action) {
        this._action.disabled = disabled
      }
    }
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

          href: this.resolvedHref,
          target: this.target
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const { resolvedHref: href, target = '_blank' } = this
      const action = typeof href === 'function'
        ? new cheetahGrid.columns.action.Action({
          action: href,
          disabled: this.disabled
        })
        : new cheetahGrid.columns.action.Action({
          action (rec) {
            window.open(rec[href], target)
          },
          disabled: this.disabled
        })
      const columnType = normalizeColumnType(this.columnType)

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
    $_CGridColumn_hrefProxy: resolveProxyPropsMethod('href')
  }
}
</script>

<style scoped>
.c-grid-link-column {
  display: none;
}
</style>

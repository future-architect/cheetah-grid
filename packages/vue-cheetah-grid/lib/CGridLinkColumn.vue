<template>
  <div class="c-grid-link-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend, normalizeColumnType, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines link column.
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridLinkColumn',
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
     * Defines disabled
     */
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  watch: {
    columnType: gridUpdateWatcher,
    href: gridUpdateWatcher,
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
      const props = ColumnMixin.methods.getPropsObjectInternal.apply(this)
      delete props.disabled
      return props
    },
    /**
     * @private
     */
    createColumn () {
      const { href, target = '_blank' } = this
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
.c-grid-link-column {
  display: none;
}
</style>

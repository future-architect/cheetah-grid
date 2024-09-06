<template>
  <div class="c-grid-tree-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend } from './c-grid/utils'

/**
 * Defines tree column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridTreeColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines disabled. You can also control each record by specifying a function.
     */
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  emits: { click: null },
  watch: {
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
        {}
      )
    },
    /**
     * @private
     */
    createColumn () {
      const columnType = new cheetahGrid.columns.type.TreeColumn({})
      const action = this._action = new cheetahGrid.columns.action.Action({
        action: (...args) => {
          /**
           * Fired when a click on cell.
           */
          this.$emit('click', ...args)
        },
        disabled: this.disabled,
        area: columnType.drawnIconActionArea
      })
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
    }
  }
}
</script>

<style scoped>
.c-grid-tree-column {
  display: none;
}
</style>

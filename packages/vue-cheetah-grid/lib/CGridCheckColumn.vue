<template>
  <div class="c-grid-check-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend } from './c-grid/utils'

/**
 * Defines checkbox column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridCheckColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines disabled. You can also control each record by specifying a function.
     */
    disabled: {
      type: [Boolean, Function],
      default: false
    },
    /**
     * Defines readonly. You can also control each record by specifying a function.
     */
    readonly: {
      type: [Boolean, Function],
      default: false
    }
  },
  watch: {
    disabled (disabled) {
      if (this._action) {
        this._action.disabled = disabled
      }
    },
    readonly (readonly) {
      if (this._action) {
        this._action.readOnly = readonly
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
        stdCol
      )
    },
    /**
     * @private
     */
    createColumn () {
      const action = this._action = new cheetahGrid.columns.action.CheckEditor({
        disabled: this.disabled,
        readOnly: this.readonly
      })
      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          columnType: 'check',
          action
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-check-column {
  display: none;
}
</style>

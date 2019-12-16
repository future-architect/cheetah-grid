<template>
  <div class="c-grid-button-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend } from './c-grid/utils'

/**
 * Defines button column.
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridButtonColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a button caption
     */
    caption: {
      type: [String],
      default: ''
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
      const action = this._action = new cheetahGrid.columns.action.ButtonAction({
        action: (...args) => {
          /**
           * Fired when a click on cell.
           */
          this.$emit('click', ...args)
        },
        disabled: this.disabled
      })
      const baseCol = ColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          caption: this.$el.textContent.trim(),
          columnType: new cheetahGrid.columns.type.ButtonColumn({
            caption: this.caption
          }),
          action
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-button-column {
  display: none;
}
</style>

<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-input-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, filterToFn, normalizeColumnType, girdUpdateWatcher } from './c-grid/utils'

/**
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridInputColumn',
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
     * Defines a helper text ganarator
     */
    helperText: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an input validator
     */
    inputValidator: {
      type: [Function],
      default: undefined
    },
    /**
     * Defines a validator
     */
    validator: {
      type: [Function],
      default: undefined
    },
    /**
     * Defines an input class name
     */
    inputClassList: {
      type: [Array, String, Function],
      default: undefined
    },
    /**
     * Defines an input type
     */
    inputType: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines disabled
     */
    disabled: {
      type: Boolean
    },
    /**
     * Defines readonly
     */
    readonly: {
      type: Boolean
    }
  },
  watch: {
    columnType: girdUpdateWatcher,
    helperText: girdUpdateWatcher,
    inputValidator: girdUpdateWatcher,
    validator: girdUpdateWatcher,
    inputClassList: girdUpdateWatcher,
    inputType: girdUpdateWatcher,
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
      const props = ColumnMixin.methods.getPropsObjectInternal.apply(this)
      delete props.disabled
      delete props.readonly
      return props
    },
    /**
     * @private
     */
    createColumn () {
      const action = this._action = new cheetahGrid.columns.action.SmallDialogInputEditor({
        helperText: this.helperText,
        inputValidator: this.inputValidator,
        validator: this.validator,
        classList: this.inputClassList,
        type: this.inputType,
        disabled: this.disabled,
        readOnly: this.readonly
      })
      const columnType = normalizeColumnType(this.columnType)
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
        caption: this.caption || this.$el.textContent.trim(),
        headerStyle: this.headerStyle,
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
.c-grid-input-column {
  display: none;
}
</style>

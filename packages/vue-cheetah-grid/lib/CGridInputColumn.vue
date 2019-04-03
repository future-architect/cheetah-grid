<template>
  <div class="c-grid-input-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, filterToFn, normalizeColumnType, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines input column.
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
      type: [Boolean, Function],
      default: false
    },
    /**
     * Defines readonly
     */
    readonly: {
      type: [Boolean, Function],
      default: false
    }
  },
  watch: {
    columnType: gridUpdateWatcher,
    helperText: gridUpdateWatcher,
    inputValidator: gridUpdateWatcher,
    validator: gridUpdateWatcher,
    inputClassList: gridUpdateWatcher,
    inputType: gridUpdateWatcher,
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
        vm: this,
        caption: this.caption || this.$el.textContent.trim(),
        headerStyle: this.headerStyle,
        headerField: this.headerField,
        headerType: this.headerType,
        headerAction: this.headerAction,
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

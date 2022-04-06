<template>
  <div class="c-grid-input-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend, normalizeColumnType, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

/**
 * Defines input column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridInputColumn',
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
  computed: {
    resolvedHelperText: resolveProxyComputedProps('helperText'),
    resolvedInputValidator: resolveProxyComputedProps('inputValidator'),
    resolvedValidator: resolveProxyComputedProps('validator'),
    resolvedInputClassList: resolveProxyComputedProps('inputClassList'),
    resolvedInputType: resolveProxyComputedProps('inputType')
  },
  watch: {
    columnType: gridUpdateWatcher,
    resolvedHelperText: gridUpdateWatcher,
    resolvedInputValidator: gridUpdateWatcher,
    resolvedValidator: gridUpdateWatcher,
    resolvedInputClassList: gridUpdateWatcher,
    resolvedInputType: gridUpdateWatcher,
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
        stdCol,
        {
          columnType: this.columnType,

          helperText: this.resolvedHelperText,
          inputValidator: this.resolvedInputValidator,
          validator: this.resolvedValidator,
          classList: this.resolvedInputClassList,
          type: this.resolvedInputType
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const action = this._action = new cheetahGrid.columns.action.SmallDialogInputEditor({
        helperText: this.resolvedHelperText,
        inputValidator: this.resolvedInputValidator,
        validator: this.resolvedValidator,
        classList: this.resolvedInputClassList,
        type: this.resolvedInputType,
        disabled: this.disabled,
        readOnly: this.readonly
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
    $_CGridColumn_helperTextProxy: resolveProxyPropsMethod('helperText'),
    /**
     * @private
     */
    $_CGridColumn_inputValidatorProxy: resolveProxyPropsMethod('inputValidator'),
    /**
     * @private
     */
    $_CGridColumn_validatorProxy: resolveProxyPropsMethod('validator'),
    /**
     * @private
     */
    $_CGridColumn_inputClassListProxy: resolveProxyPropsMethod('inputClassList'),
    /**
     * @private
     */
    $_CGridColumn_inputTypeProxy: resolveProxyPropsMethod('inputType')
  }
}
</script>

<style scoped>
.c-grid-input-column {
  display: none;
}
</style>

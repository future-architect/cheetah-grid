<template>
  <div class="c-grid-menu-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

function isDisabledRecord (option, record) {
  if (typeof option === 'function') {
    return !!option(record)
  }
  return !!option
}

/**
 * Defines select menu column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridMenuColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a menu options
     */
    options: {
      type: [Object, Array],
      default: undefined
    },
    /**
     * Defines a menu options for display
     */
    displayOptions: {
      type: [Object, Array],
      default: undefined
    },
    /**
     * Defines a menu options for popup
     */
    editorOptions: {
      type: [Object, Array, Function],
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
    resolvedEditorOptions: resolveProxyComputedProps('editorOptions')
  },
  watch: {
    options: gridUpdateWatcher,
    displayOptions: gridUpdateWatcher,
    resolvedEditorOptions: gridUpdateWatcher,
    disabled (disabled) {
      if (this._action) {
        this._action.disabled = disabled
        // apply style
        this.$nextTick(this.nextTickInvalidate)
      }
    },
    readonly (readonly) {
      if (this._action) {
        this._action.readOnly = readonly
        // apply style
        this.$nextTick(this.nextTickInvalidate)
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
          options: this.options,
          displayOptions: this.displayOptions,
          editorOptions: this.resolvedEditorOptions
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const dispOpt = this.displayOptions || this.options
      const actionOpt = this.resolvedEditorOptions || this.options
      const action = this._action = actionOpt ? new cheetahGrid.columns.action.InlineMenuEditor({
        options: actionOpt,
        disabled: this.disabled,
        readOnly: this.readonly
      }) : undefined
      const columnType = new cheetahGrid.columns.type.MenuColumn({ options: dispOpt })

      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          columnType,
          action,
          style: (...args) => {
            let style = this.columnStyle
            if (typeof style === 'function') {
              style = style(...args)
            }
            if (
              isDisabledRecord(this.disabled, ...args) ||
              isDisabledRecord(this.readonly, ...args)
            ) {
              if (style) {
                if (style.clone) {
                  style = style.clone()
                } else {
                  style = extend({}, style)
                }
                style.appearance = 'none'
              } else {
                style = { appearance: 'none' }
              }
            }
            return style
          }
        }
      )
    },

    /**
     * @private
     */
    $_CGridColumn_editorOptionsProxy: resolveProxyPropsMethod('editorOptions')
  }
}
</script>

<style scoped>
.c-grid-menu-column {
  display: none;
}
</style>

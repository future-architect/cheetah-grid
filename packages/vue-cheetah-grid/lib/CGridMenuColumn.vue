<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-menu-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, filterToFn, girdUpdateWatcher } from './c-grid/utils'

/**
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridMenuColumn',
  mixins: [ColumnMixin, StdColumnMixin],
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
      type: [Object, Array],
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
    options: girdUpdateWatcher,
    displayOptions: girdUpdateWatcher,
    editorOptions: girdUpdateWatcher,
    disabled (disabled) {
      if (this._action) {
        this._action.disabled = disabled
        // apply style
        this.invalidate()
      }
    },
    readonly (readonly) {
      if (this._action) {
        this._action.readOnly = readonly
        // apply style
        this.invalidate()
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
      const dispOpt = this.displayOptions || this.options
      const actionOpt = this.editorOptions || this.options
      const action = this._action = actionOpt ? new cheetahGrid.columns.action.InlineMenuEditor({
        options: actionOpt,
        disabled: this.disabled,
        readOnly: this.readonly
      }) : undefined
      const columnType = new cheetahGrid.columns.type.MenuColumn({ options: dispOpt })
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
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
        style: (...args) => {
          let style = this.columnStyle
          if (typeof style === 'function') {
            style = style(...args)
          }
          if (this.disabled || this.readonly) {
            if (style) {
              if (style.clone) {
                style = style.clone()
              } else {
                style = Object.assign({}, style)
              }
              style.appearance = 'none'
            } else {
              style = { appearance: 'none' }
            }
          }
          return style
        },
        sort: this.sort,
        icon: this.icon,
        message: this.message
      }
    }
  }
}
</script>

<style scoped>
.c-grid-menu-column {
  display: none;
}
</style>

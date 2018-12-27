<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-check-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, filterToFn } from './c-grid/utils'

/**
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridCheckColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
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
      const action = this._action = new cheetahGrid.columns.action.CheckEditor({
        disabled: this.disabled,
        readOnly: this.readonly
      })
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
        vm: this,
        caption: this.caption || this.$el.textContent.trim(),
        headerStyle: this.headerStyle,
        headerField: this.headerField,
        headerType: this.headerType,
        headerAction: this.headerAction,
        field,
        columnType: 'check',
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
.c-grid-check-column {
  display: none;
}
</style>

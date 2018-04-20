<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-input-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import {cheetahGrid, filterToFn, normalizeColumnType} from './c-grid/utils'

export default {
  name: 'CGridInputColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
    columnType: {
      type: [Object, String, Function],
      default: undefined
    },
    helperText: {
      type: [String, Function],
      default: undefined
    },
    inputValidator: {
      type: [Function],
      default: undefined
    },
    validator: {
      type: [Function],
      default: undefined
    },
    inputClassList: {
      type: [Array, String, Function],
      default: undefined
    },
    inputType: {
      type: [String, Function],
      default: undefined
    }
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const columnType = normalizeColumnType(this.columnType)
      const action = new cheetahGrid.columns.action.SmallDialogInputEditor({
        helperText: this.helperText,
        inputValidator: this.inputValidator,
        validator: this.validator,
        classList: this.inputClassList,
        type: this.inputType
      })
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
        caption: this.caption || this.$el.textContent.trim(),
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

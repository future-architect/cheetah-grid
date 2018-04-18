<template>
  <div class="c-grid-percent-complete-bar-column"><slot /></div>
</template>

<script>
import {cheetahGrid, normalizeAction, filterToFn, columnMixin, columnStdMixin} from './c-grid/utils'

export default {
  name: 'CGridPercentCompleteBarColumn',
  mixins: [columnMixin, columnStdMixin],
  props: {
    formatter: {
      type: [Function],
      default: undefined
    },
    min: {
      type: [Number, String],
      default: undefined
    },
    max: {
      type: [Number, String],
      default: undefined
    },
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  methods: {
    createColumn () {
      const columnType = new cheetahGrid.columns.type.PercentCompleteBarColumn({
        min: this.min,
        max: this.max,
        formatter: this.formatter
      })
      const action = normalizeAction(this.action)
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
.c-grid-percent-complete-bar-column {
  display: none;
}
</style>

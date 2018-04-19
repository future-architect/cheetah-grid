<template>
  <div class="c-grid-column"><slot /></div>
</template>

<script>
import {filterToFn, normalizeColumnType, normalizeAction, columnMixin, columnStdMixin} from './c-grid/utils'

export default {
  name: 'CGridColumn',
  mixins: [columnMixin, columnStdMixin],
  props: {
    columnType: {
      type: [Object, String, Function],
      default: undefined
    },
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  methods: {
    createColumn () {
      const columnType = normalizeColumnType(this.columnType)
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
.c-grid-column {
  display: none;
}
</style>

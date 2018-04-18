<template>
  <div class="c-grid-menu-column"><slot /></div>
</template>

<script>
import {cheetahGrid, filterToFn, columnMixin, columnStdMixin} from './c-grid/utils'

export default {
  name: 'CGridMenuColumn',
  mixins: [columnMixin, columnStdMixin],
  props: {
    options: {
      type: [Object, Array],
      default: undefined
    },
    displayOptions: {
      type: [Object, Array],
      default: undefined
    },
    editorOptions: {
      type: [Object, Array],
      default: undefined
    }
  },
  methods: {
    createColumn () {
      const dispOpt = this.displayOptions || this.options
      const columnType = new cheetahGrid.columns.type.MenuColumn({options: dispOpt})
      const actionOpt = this.editorOptions || this.options
      const action = actionOpt ? new cheetahGrid.columns.action.InlineMenuEditor({options: actionOpt}) : undefined
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
.c-grid-menu-column {
  display: none;
}
</style>

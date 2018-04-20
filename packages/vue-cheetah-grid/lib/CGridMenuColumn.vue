<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-menu-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import {cheetahGrid, filterToFn} from './c-grid/utils'

export default {
  name: 'CGridMenuColumn',
  mixins: [ColumnMixin, StdColumnMixin],
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
    /**
     * @private
     */
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

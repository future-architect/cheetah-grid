<template>
  <div class="c-grid-button-column"><slot /></div>
</template>

<script>
import {cheetahGrid, filterToFn, columnMixin, columnStdMixin} from './c-grid/utils'

export default {
  name: 'CGridButtonColumn',
  mixins: [columnMixin, columnStdMixin],
  props: {},
  methods: {
    createColumn () {
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
        caption: this.$el.textContent.trim(),
        field,
        width: this.width,
        minWidth: this.minWidth,
        maxWidth: this.maxWidth,
        style: this.columnStyle,
        sort: this.sort,
        icon: this.icon,
        message: this.message,

        columnType: new cheetahGrid.columns.type.ButtonColumn({
          caption: this.caption
        }),
        action: new cheetahGrid.columns.action.ButtonAction({
          action: (...args) => this.$emit('click', ...args)
        })
      }
    }
  }
}

</script>

<style scoped>
.c-grid-button-column {
  display: none;
}
</style>

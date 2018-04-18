<template>
  <div class="c-grid-icon-column"><slot /></div>
</template>

<script>
import {cheetahGrid, filterToFn, normalizeAction, columnMixin, columnStdMixin} from './c-grid/utils'

export default {
  name: 'CGridIconColumn',
  mixins: [columnMixin, columnStdMixin],
  props: {
    iconTagName: {
      type: [String, Function],
      default: undefined
    },
    iconClassName: {
      type: [String, Function],
      default: undefined
    },
    iconContent: {
      type: [String, Function],
      default: undefined
    },
    iconName: {
      type: [String, Function],
      default: undefined
    },
    iconWidth: {
      type: [Number, String, Function],
      default: undefined
    },
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  methods: {
    createColumn () {
      const columnType = new cheetahGrid.columns.type.IconColumn({
        tagName: this.iconTagName,
        className: this.iconClassName,
        content: this.iconContent,
        name: this.iconName,
        iconWidth: this.iconWidth
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
.c-grid-icon-column {
  display: none;
}
</style>

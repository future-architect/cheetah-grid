<template>
  <div class="c-grid-link-column"><slot /></div>
</template>

<script>
import {cheetahGrid, filterToFn, normalizeColumnType, columnMixin, columnStdMixin} from './c-grid/utils'

export default {
  name: 'CGridLinkColumn',
  mixins: [columnMixin, columnStdMixin],
  props: {
    columnType: {
      type: [Object, String, Function],
      default: undefined
    },
    href: {
      type: [String, Function],
      default: undefined
    },
    target: {
      type: [String],
      default: undefined
    }
  },
  methods: {
    createColumn () {
      const columnType = normalizeColumnType(this.columnType)

      const {href, target = '_blank'} = this
      const action = typeof href === 'function'
        ? new cheetahGrid.columns.action.Action({
          action: href
        })
        : new cheetahGrid.columns.action.Action({
          action (rec) {
            window.open(rec[href], target)
          }
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
.c-grid-link-column {
  display: none;
}
</style>

<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-icon-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import {cheetahGrid, filterToFn, normalizeAction} from './c-grid/utils'

/**
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridIconColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines an icon tag name
     */
    iconTagName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon class name
     */
    iconClassName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon content
     */
    iconContent: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon name
     */
    iconName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon width
     */
    iconWidth: {
      type: [Number, String, Function],
      default: undefined
    },
    /**
     * Defines an action
     */
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  methods: {
    /**
     * @private
     */
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

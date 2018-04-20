<template>
  <!-- Use this slot to set the header caption -->
  <div class="c-grid-button-column"><slot /></div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import {cheetahGrid, filterToFn} from './c-grid/utils'

/**
 * @mixin column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridButtonColumn',
  mixins: [ColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a button caption
     */
    caption: {
      type: [String],
      default: ''
    }
  },
  methods: {
    /**
     * @private
     */
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
          action: (...args) => {
            /**
             * Fired when a click on cell.
             */
            this.$emit('click', ...args)
          }
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

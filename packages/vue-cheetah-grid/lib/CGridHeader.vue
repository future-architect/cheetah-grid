<template>
  <div class="c-grid-header">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import ColumnMixin from './c-grid/ColumnMixin.vue'
import { extend, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines layout header.
 * @mixin column-mixin
 */
export default {
  name: 'CGridHeader',
  mixins: [ColumnMixin],
  props: {
    /**
     * Defines a button caption
     */
    caption: {
      type: [String],
      default: ''
    }
  },
  watch: {
    columnType: gridUpdateWatcher,
    action: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const baseCol = ColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        {
          caption: this.caption || this.$el.textContent.trim()
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-header {
  display: none;
}
</style>

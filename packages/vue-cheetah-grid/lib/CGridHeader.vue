<template>
  <div class="c-grid-header">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import { extend, gridUpdateWatcher } from './c-grid/utils'

/**
 * Defines layout header.
 * Can be used in the `layout-header` slot of `CGrid`.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 */
export default {
  name: 'CGridHeader',
  mixins: [LayoutColumnMixin],
  props: {
    /**
     * Defines a header caption
     */
    caption: {
      type: [String],
      default: ''
    },
    /**
     * Defines a default column width
     */
    width: {
      type: [Number, String],
      default: undefined
    },
    /**
     * Defines a column min width
     */
    minWidth: {
      type: [Number, String],
      default: undefined
    },
    /**
     * Defines a column max width
     */
    maxWidth: {
      type: [Number, String],
      default: undefined
    },
    /**
     * Defines the layout colspan.
     */
    colspan: {
      type: [Number, String],
      default: undefined
    },
    /**
     * Defines the layout rowspan.
     */
    rowspan: {
      type: [Number, String],
      default: undefined
    }
  },
  watch: {
    width: gridUpdateWatcher,
    minWidth: gridUpdateWatcher,
    maxWidth: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        {
          caption: this.caption || this.$el.textContent.trim(),
          width: this.width,
          minWidth: this.minWidth,
          maxWidth: this.maxWidth
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

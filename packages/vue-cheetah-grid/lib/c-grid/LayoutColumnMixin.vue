<script>
import { gridUpdateWatcher, extend } from './utils'
import ColumnMixin from './ColumnMixin.vue'

/**
 * The Mixin for `<c-grid-column>` components.
 * @mixin column-mixin
 */
export default {
  mixins: [ColumnMixin],
  inject: ['$_CGridInstance'],
  props: {
    /**
     * Defines the layout colspan.
     * This property can be used when defining in the `layout-header` and `layout-body` slots.
     */
    colspan: {
      type: [Number, String],
      default: undefined
    },
    /**
     * Defines the layout rowspan.
     * This property can be used when defining in the `layout-header` and `layout-body` slots.
     */
    rowspan: {
      type: [Number, String],
      default: undefined
    }
  },
  watch: {
    colspan: gridUpdateWatcher,
    rowspan: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     * @override
     */
    getPropsObjectInternal () {
      const baseCol = ColumnMixin.methods.getPropsObjectInternal.apply(this)
      return extend(
        baseCol,
        {
          colSpan: this.colspan,
          rowSpan: this.rowspan
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const baseCol = ColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        {
          colSpan: this.colspan,
          rowSpan: this.rowspan
        }
      )
    }
  }
}
</script>

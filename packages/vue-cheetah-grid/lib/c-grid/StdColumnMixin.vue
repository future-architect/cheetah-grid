<script>
import { gridUpdateWatcher, filterToFn } from './utils'

/**
 * The Mixin for `<c-grid-column>` components.
 * It is used except for `<c-grid-column-group>`.
 */
export default {
  props: {
    /**
     * Defines a column data field
     */
    field: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines a vue filter name
     */
    filter: {
      type: [String, Function],
      default: undefined
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
     * Defines a column style
     */
    columnStyle: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines an icon
     */
    icon: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines a Message generation method
     */
    message: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  watch: {
    field: gridUpdateWatcher,
    filter: gridUpdateWatcher,
    width: gridUpdateWatcher,
    minWidth: gridUpdateWatcher,
    maxWidth: gridUpdateWatcher,
    columnStyle: gridUpdateWatcher,
    icon: gridUpdateWatcher,
    message: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const field = this.filter ? filterToFn(this, this.field, this.filter) : this.field
      return {
        field,
        width: this.width,
        minWidth: this.minWidth,
        maxWidth: this.maxWidth,
        style: this.columnStyle,
        icon: this.icon,
        message: this.message
      }
    }
  }
}
</script>

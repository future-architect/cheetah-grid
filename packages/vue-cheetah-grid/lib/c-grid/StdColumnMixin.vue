<script>
/**
 * The Mixin for `<c-grid-column>` components.
 * It is used except for `<c-grid-column-group>`.
 */
export default {
  props: {
    field: {
      type: [Object, String, Function],
      default: undefined
    },
    filter: {
      type: [String, Function],
      default: undefined
    },
    width: {
      type: [Number, String],
      default: undefined
    },
    minWidth: {
      type: [Number, String],
      default: undefined
    },
    maxWidth: {
      type: [Number, String],
      default: undefined
    },
    columnStyle: {
      type: [Object, String, Function],
      default: undefined
    },
    icon: {
      type: [Object, String, Function],
      default: undefined
    },
    message: {
      type: [Object, String, Function],
      default: undefined
    }
  }
}
</script>

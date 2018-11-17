<script>
import { girdUpdateWatcher } from './utils'

/**
 * The Mixin for `<c-grid-column>` components.
 */
export default {
  props: {
    /**
     * Defines a header caption
     */
    caption: {
      type: [String],
      default: ''
    },
    /**
     * Defines a sort
     */
    sort: {
      type: [String, Function, Boolean],
      default: undefined
    },
    /**
     * Defines a column header style
     */
    headerStyle: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines a column header data field
     */
    headerField: {
      type: [String],
      default: undefined
    },
    /**
     * Defines a column header type
     */
    headerType: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines a column header action
     */
    headerAction: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  watch: {
    caption: girdUpdateWatcher,
    sort: girdUpdateWatcher,
    headerStyle: girdUpdateWatcher,
    headerField: girdUpdateWatcher,
    headerType: girdUpdateWatcher,
    headerAction: girdUpdateWatcher
  },
  mounted () {
    this.$_CGrid_nextTickUpdate()
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  methods: {
    /**
     * Redraws the whole grid.
     * @return {void}
     */
    invalidate () {
      if (this.$parent && this.$parent.invalidate) {
        this.$parent.invalidate()
      }
    },
    /**
     * Returns the property Object to judge the change.
     * @protected
     * @returns {object}
     */
    getPropsObjectInternal () {
      const props = Object.assign({}, this.$props)
      props.textContent = this.$el.textContent.trim()
      return props
    },
    /**
     * @private
     */
    $_CGrid_update () {
      if (this.$parent && this.$parent.$_CGrid_update) {
        this.$parent.$_CGrid_update()
      }
    },
    /**
     * @private
     */
    $_CGrid_nextTickUpdate () {
      if (this.$parent && this.$parent.$_CGrid_nextTickUpdate) {
        this.$parent.$_CGrid_nextTickUpdate()
      }
    }
  }
}
</script>

<script>
import { gridUpdateWatcher, extend } from './utils'

/**
 * The Mixin for `<c-grid-column>` components.
 */
export default {
  inject: ['$_CGridInstance'],
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
    caption: gridUpdateWatcher,
    sort: gridUpdateWatcher,
    headerStyle: gridUpdateWatcher,
    headerField: gridUpdateWatcher,
    headerType: gridUpdateWatcher,
    headerAction: gridUpdateWatcher
  },
  mounted () {
    this.$_CGridInstance.$_CGrid_setColumnDefine(this)
    this.$_CGrid_nextTickUpdate()
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  beforeDestroy () {
    this.$_CGridInstance.$_CGrid_removeColumnDefine(this)
  },
  methods: {
    /**
     * Redraws the whole grid.
     * @return {void}
     */
    invalidate () {
      if (this.$_CGridInstance && this.$_CGridInstance.invalidate) {
        this.$_CGridInstance.invalidate()
      }
    },
    /**
     * Returns the property Object to judge the change.
     * @protected
     * @returns {object}
     */
    getPropsObjectInternal () {
      const props = extend({}, this.$props)
      props.textContent = this.$el.textContent.trim()

      if (typeof this.normalizeProps !== 'function') {
        return props
      }
      const normalized = this.normalizeProps(props)
      return extend(props, normalized)
    },
    /**
     * @private
     */
    createColumn () {
      return {
        vm: this,
        caption: this.caption,
        headerStyle: this.headerStyle,
        headerField: this.headerField,
        headerType: this.headerType,
        headerAction: this.headerAction,
        sort: this.sort
      }
    },
    /**
     * @private
     */
    $_CGrid_update () {
      if (this.$_CGridInstance && this.$_CGridInstance.$_CGrid_update) {
        this.$_CGridInstance.$_CGrid_update()
      }
    },
    /**
     * @private
     */
    $_CGrid_nextTickUpdate () {
      if (this.$_CGridInstance && this.$_CGridInstance.$_CGrid_nextTickUpdate) {
        this.$_CGridInstance.$_CGrid_nextTickUpdate()
      }
    }
  }
}
</script>

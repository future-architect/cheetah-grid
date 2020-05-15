<script>
import { gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './utils'

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
  computed: {
    resolvedSort: resolveProxyComputedProps('sort'),
    resolvedHeaderStyle: resolveProxyComputedProps('headerStyle'),
    resolvedHeaderType: resolveProxyComputedProps('headerType'),
    resolvedHeaderAction: resolveProxyComputedProps('headerAction')
  },
  watch: {
    caption: gridUpdateWatcher,
    resolvedSort: gridUpdateWatcher,
    resolvedHeaderStyle: gridUpdateWatcher,
    headerField: gridUpdateWatcher,
    resolvedHeaderType: gridUpdateWatcher,
    resolvedHeaderAction: gridUpdateWatcher
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
      return {
        caption: this.caption,
        headerStyle: this.resolvedHeaderStyle,
        headerField: this.headerField,
        headerType: this.resolvedHeaderType,
        headerAction: this.resolvedHeaderAction,
        sort: this.resolvedSort
      }
    },
    /**
     * @private
     */
    createColumn () {
      return {
        vm: this,
        caption: this.caption,
        headerStyle: this.resolvedHeaderStyle,
        headerField: this.headerField,
        headerType: this.resolvedHeaderType,
        headerAction: this.resolvedHeaderAction,
        sort: this.resolvedSort
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
    },

    /**
     * @private
     */
    $_CGridColumn_sortProxy: resolveProxyPropsMethod('sort'),
    /**
     * @private
     */
    $_CGridColumn_headerStyleProxy: resolveProxyPropsMethod('headerStyle'),
    /**
     * @private
     */
    $_CGridColumn_headerTypeProxy: resolveProxyPropsMethod('headerType'),
    /**
     * @private
     */
    $_CGridColumn_headerActionProxy: resolveProxyPropsMethod('headerAction')
  }
}
</script>

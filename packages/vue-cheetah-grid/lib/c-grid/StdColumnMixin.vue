<script>
import {
  gridUpdateWatcher,
  filterToFn,
  resolveProxyComputedProps,
  resolveProxyPropsMethod
} from './utils'

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
  data () {
    return {
      pluginMessageFunctions: []
    }
  },
  computed: {
    resolvedField0: resolveProxyComputedProps('field'),
    resolvedField () {
      return this.resolvedFilter ? filterToFn(this, this.resolvedField0, this.resolvedFilter) : this.resolvedField0
    },
    resolvedFilter: resolveProxyComputedProps('filter'),
    resolvedColumnStyle: resolveProxyComputedProps('columnStyle'),
    resolvedIcon: resolveProxyComputedProps('icon'),
    resolvedMessage: resolveProxyComputedProps('message'),
    compositedMessages () {
      const { resolvedMessage, pluginMessageFunctions } = this
      const results = []
      if (resolvedMessage) {
        results.push(resolvedMessage)
      }
      results.push(...pluginMessageFunctions)
      return results
    }
  },
  watch: {
    resolvedField: gridUpdateWatcher,
    width: gridUpdateWatcher,
    minWidth: gridUpdateWatcher,
    maxWidth: gridUpdateWatcher,
    resolvedColumnStyle: gridUpdateWatcher,
    resolvedIcon: gridUpdateWatcher,
    resolvedMessage: gridUpdateWatcher,
    compositedMessages: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     * @override
     */
    getPropsObjectInternal () {
      return {
        field: this.resolvedField0,
        filter: this.resolvedFilter,
        width: this.width,
        minWidth: this.minWidth,
        maxWidth: this.maxWidth,
        style: this.resolvedColumnStyle,
        icon: this.resolvedIcon,
        message: this.compositedMessages
      }
    },
    /**
     * @private
     */
    createColumn () {
      return {
        field: this.resolvedField,
        width: this.width,
        minWidth: this.minWidth,
        maxWidth: this.maxWidth,
        style: this.resolvedColumnStyle,
        icon: this.resolvedIcon,
        message: this.compositedMessages
      }
    },

    /**
     * @private
     */
    $_CGridColumn_fieldProxy: resolveProxyPropsMethod('field'),
    /**
     * @private
     */
    $_CGridColumn_filterProxy: resolveProxyPropsMethod('filter'),
    /**
     * @private
     */
    $_CGridColumn_columnStyleProxy: resolveProxyPropsMethod('columnStyle'),
    /**
     * @private
     */
    $_CGridColumn_iconProxy: resolveProxyPropsMethod('icon'),
    /**
     * @private
     */
    $_CGridColumn_messageProxy: resolveProxyPropsMethod('message')
  }
}
</script>

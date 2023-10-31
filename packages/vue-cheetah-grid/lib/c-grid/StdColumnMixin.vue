<script>
import {
  gridUpdateWatcher,
  filterToFn,
  resolveProxyComputedProps,
  resolveProxyPropsMethod,
  isObject
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
     * Defines a column style. Same as [the `style` property of the JS API](https://future-architect.github.io/cheetah-grid/documents/api/js/column_styles/).
     */
    columnStyle: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines an icon. Same as [the `icon` property of the JS API](https://future-architect.github.io/cheetah-grid/documents/api/js/column_icon.html).
     */
    icon: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines a message generation method. Same as [the `message` property of the JS API](https://future-architect.github.io/cheetah-grid/documents/api/js/cell_message.html).
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
    resolvedField0 () {
      const { field } = this
      if (typeof field === 'function') {
        return this.$_CGridColumn_fieldProxy
      }
      if (isObject(field)) {
        return {
          get: field.get && this.$_CGridColumn_objectFieldGetProxy,
          set: field.set && this.$_CGridColumn_objectFieldSetProxy
        }
      }
      return field
    },
    resolvedField () {
      return this.resolvedFilter ? filterToFn(this, this.resolvedField0, this.resolvedFilter) : this.resolvedField0
    },
    resolvedFilter: resolveProxyComputedProps('filter'),
    resolvedColumnStyle: resolveProxyComputedProps('columnStyle'),
    resolvedIcon: resolveProxyComputedProps('icon'),
    resolvedMessage: resolveProxyComputedProps('message'),
    compositedMessages () {
      const { resolvedMessage } = this
      const pluginMessageFunctions = this.$_CGridColumn_getPluginMessageFunctions()
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
    $_CGridColumn_messageProxy: resolveProxyPropsMethod('message'),
    /**
     * @private
     */
    $_CGridColumn_objectFieldGetProxy (...args) {
      return this.field.get(...args)
    },
    /**
     * @private
     */
    $_CGridColumn_objectFieldSetProxy (...args) {
      return this.field.set(...args)
    },
    /**
     * @private
     */
    $_CGridColumn_getPluginMessageFunctions () {
      if (!this.cachedPluginMessageFunctions) {
        this.cachedPluginMessageFunctions = []
      }
      this.cachedPluginMessageFunctions.length = this.pluginMessageFunctions.length

      for (let i = 0; i < this.pluginMessageFunctions.length; i++) {
        if (!this.cachedPluginMessageFunctions[i]) {
          const index = i
          this.cachedPluginMessageFunctions[index] = (...args) => this.pluginMessageFunctions[index](...args)
        }
      }
      return this.cachedPluginMessageFunctions
    }
  }
}
</script>

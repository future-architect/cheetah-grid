<template>
  <div class="c-grid-icon-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend, normalizeAction, gridUpdateWatcher, resolveProxyComputedProps, resolveProxyPropsMethod } from './c-grid/utils'

/**
 * Defines icon column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridIconColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines an icon tag name
     */
    iconTagName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon class name
     */
    iconClassName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon content
     */
    iconContent: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon name
     */
    iconName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon width
     */
    iconWidth: {
      type: [Number, String, Function],
      default: undefined
    },
    /**
     * Defines an action
     */
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  computed: {
    resolvedIconTagName: resolveProxyComputedProps('iconTagName'),
    resolvedIconClassName: resolveProxyComputedProps('iconClassName'),
    resolvedIconContent: resolveProxyComputedProps('iconContent'),
    resolvedIconName: resolveProxyComputedProps('iconName'),
    resolvedIconWidth: resolveProxyComputedProps('iconWidth'),
    resolvedAction: resolveProxyComputedProps('action')
  },
  watch: {
    resolvedIconTagName: gridUpdateWatcher,
    resolvedIconClassName: gridUpdateWatcher,
    resolvedIconContent: gridUpdateWatcher,
    resolvedIconName: gridUpdateWatcher,
    resolvedIconWidth: gridUpdateWatcher,
    resolvedAction: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     * @override
     */
    getPropsObjectInternal () {
      const baseCol = LayoutColumnMixin.methods.getPropsObjectInternal.apply(this)
      const stdCol = StdColumnMixin.methods.getPropsObjectInternal.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          tagName: this.resolvedIconTagName,
          className: this.resolvedIconClassName,
          content: this.resolvedIconContent,
          name: this.resolvedIconName,
          iconWidth: this.resolvedIconWidth,

          action: this.resolvedAction
        }
      )
    },
    /**
     * @private
     */
    createColumn () {
      const columnType = new cheetahGrid.columns.type.IconColumn({
        tagName: this.resolvedIconTagName,
        className: this.resolvedIconClassName,
        content: this.resolvedIconContent,
        name: this.resolvedIconName,
        iconWidth: this.resolvedIconWidth
      })
      const action = normalizeAction(this.resolvedAction)

      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          columnType,
          action
        }
      )
    },

    /**
     * @private
     */
    $_CGridColumn_iconTagNameProxy: resolveProxyPropsMethod('iconTagName'),
    /**
     * @private
     */
    $_CGridColumn_iconClassNameProxy: resolveProxyPropsMethod('iconClassName'),
    /**
     * @private
     */
    $_CGridColumn_iconContentProxy: resolveProxyPropsMethod('iconContent'),
    /**
     * @private
     */
    $_CGridColumn_iconNameProxy: resolveProxyPropsMethod('iconName'),
    /**
     * @private
     */
    $_CGridColumn_iconWidthProxy: resolveProxyPropsMethod('iconWidth'),
    /**
     * @private
     */
    $_CGridColumn_actionProxy: resolveProxyPropsMethod('action')
  }
}
</script>

<style scoped>
.c-grid-icon-column {
  display: none;
}
</style>

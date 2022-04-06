<template>
  <div class="c-grid-radio-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
import StdColumnMixin from './c-grid/StdColumnMixin.vue'
import { cheetahGrid, extend } from './c-grid/utils'

/**
 * Defines radio button column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridRadioColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines disabled. You can also control each record by specifying a function.
     */
    disabled: {
      type: [Boolean, Function],
      default: false
    },
    /**
     * Defines readonly. You can also control each record by specifying a function.
     */
    readonly: {
      type: [Boolean, Function],
      default: false
    },
    /**
     * Change the check action from the default.
     */
    checkAction: {
      type: Function,
      default: undefined
    },
    /**
     * Define a function that returns a radio group.
     * @deprecated Use `checkAction` instead.
     */
    group: {
      type: Function,
      default: undefined
    }
  },
  watch: {
    disabled (disabled) {
      if (this._action) {
        this._action.disabled = disabled
      }
    },
    readonly (readonly) {
      if (this._action) {
        this._action.readOnly = readonly
      }
    },
    checkAction (checkAction) {
      if (this._action) {
        this._action.checkAction = checkAction
      }
    },
    group (group) {
      if (this._action) {
        this._action.group = group
      }
    }
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
        stdCol
      )
    },
    /**
     * @private
     */
    createColumn () {
      const action = this._action = new cheetahGrid.columns.action.RadioEditor({
        disabled: this.disabled,
        readOnly: this.readonly,
        checkAction: this.checkAction,
        group: this.group
      })
      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          columnType: 'radio',
          action
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-radio-column {
  display: none;
}
</style>

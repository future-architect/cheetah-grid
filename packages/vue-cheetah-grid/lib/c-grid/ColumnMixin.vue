<script>
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
    }
  },
  mounted () {
    if (this.$parent && this.$parent.$_CGrid_update) {
      this.$parent.$_CGrid_update()
    }
  },
  updated () {
    if (this.$parent && this.$parent.$_CGrid_update) {
      this.$parent.$_CGrid_update()
    }
  },
  methods: {
    /**
     * @private
     */
    $_CGridColumn_getProps () {
      const props = Object.assign({}, this.$props)
      props.textContent = this.$el.textContent.trim()
      return props
    }
  }
}
</script>

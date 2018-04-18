<template>
  <div class="c-grid-column-group"><slot /></div>
</template>

<script>
import {slotsToHeaderOptions} from './c-grid/header-utils'
import {columnMixin} from './c-grid/utils'

export default {
  name: 'CGridColumnGroup',
  mixins: [columnMixin],
  props: {
    headerStyle: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  methods: {
    createColumn () {
      return {
        caption: this.caption,
        headerStyle: this.headerStyle,
        sort: this.sort,
        columns: slotsToHeaderOptions(this.$slots.default)
      }
    }
  }
}

</script>

<style scoped>
.c-grid-column-group {
  display: none;
}
</style>

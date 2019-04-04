<template>
  <div class="preview">
    <component :is="component" />
  </div>
</template>

<script>
import './app/parsons'

export default {
  name: 'VuePreview',
  components: {},
  mixins: [],
  props: {
    template: {
      type: String,
      default: ''
    },
    js: {
      type: Object,
      default () {
        return {}
      }
    },
    data: {
      type:Object,
      default() {
        return {}
      }
    }
  },
  data () {
    return { component: 'div' }
  },
  watch: {
    template () {
      this.renderPreview()
    }
  },
  mounted () {
    this.renderPreview()
  },
  methods: {
    renderPreview () {
      const vm = this

      const template = `
      <div class="user-preview" >
        ${vm.template}
      </div>`
      vm.component = Object.assign({ },
        {
          template,
          mixins: [vm.js || {}],
          components: { },
          data() {
            return vm.data
          }
        })
    }
  }
}
</script>

<style scoped>
.user-preview {
  margin: 0.85rem 0;
}
</style>

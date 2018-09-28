/* global Vue,vueCheetahGrid */

Vue.use(vueCheetahGrid)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  data () {
    return {
      data: [
        { text: 'text', menu: '01', check: true },
        { text: 'text', menu: '01', check: true },
        { text: 'text', menu: '01', check: true }
      ],
      options: [
        { value: '01', caption: 'A' },
        { value: '02', caption: 'B' },
        { value: '03', caption: 'C' }
      ],
      disabled: true
    }
  },
  methods: {
    onClick (rec) {
      alert(JSON.stringify(rec))
    },
    onToggleDisabled (rec) {
      this.disabled = !this.disabled
    }
  }
})

import { createApp } from 'vue'
import router from './router'
import cheetahGrid from 'cheetah-grid'
import CGrid from 'vue-cheetah-grid'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(CGrid)

cheetahGrid.themes.default = cheetahGrid.themes.default.extends({
  // font: '16px Roboto, sans-serif'
})
// router hook
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Cheetah Grid Demo`
  next()
})
app.mixin({
  methods: {
    numberDelimiter: (value) => value.toLocaleString(),
    dateFormat (d, fmt) {
      if (!d) {
        return ''
      }
      if (isNaN(new Date(d))) {
        return d
      }
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    }
  }
})
app.mount('#app-root')

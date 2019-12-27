
import cheetahGrid from 'cheetah-grid'
import Vue from 'vue'
import VueRouter from 'vue-router'
import router from './router'
import CGrid from 'vue-cheetah-grid'
import App from './App.vue'

Vue.use(VueRouter)
Vue.use(CGrid)

Vue.filter('numberDelimiter', (value) => value.toLocaleString())

// todo use fmt
Vue.filter('dateFormat', (d, fmt) => {
  if (!d) {
    return ''
  }
  if (isNaN(new Date(d))) {
    return d
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
})

cheetahGrid.themes.default = cheetahGrid.themes.default.extends({
  // font: '16px Roboto, sans-serif'
})
// router hook
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Cheetah Grid Demo`
  next()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  render (h) {
    return h(App)
  }
})

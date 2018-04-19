import Vue from 'vue'
import VueRouter from 'vue-router'
import WelcomePage from '../vue/WelcomePage.vue'
import BranchGraphPage from '../vue/BranchGraphPage.vue'
import EnterprisePage from '../vue/EnterprisePage.vue'
import AnimalsPage from '../vue/AnimalsPage.vue'

Vue.use(VueRouter)

export default new VueRouter({
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomePage,
      meta: {
        title: 'Welcome'
      }
    },

    {
      path: '/branch-graph',
      name: 'branch-graph',
      component: BranchGraphPage,
      meta: {
        title: 'Branch Graph'
      }
    },

    {
      path: '/enterprise',
      name: 'enterprise',
      component: EnterprisePage,
      meta: {
        title: 'Enterprise'
      }
    },

    {
      path: '/animals',
      name: 'animals',
      component: AnimalsPage,
      meta: {
        title: 'Animals'
      }
    }
  ]
})

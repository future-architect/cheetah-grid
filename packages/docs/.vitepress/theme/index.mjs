import DefaultTheme from 'vitepress/theme'
import './style.css'
import CodePreview from './components/CodePreview.vue'
import './components/lib/app/parsons.mjs'
// import PageTitle from "./components/PageTitle.vue";

/**
 * @typedef {import('vitepress').EnhanceAppContext} EnhanceAppContext
 */
export default {
  ...DefaultTheme,
  /**
   * @param {EnhanceAppContext} ctx context
   * @returns {void}
   */
  enhanceApp: (ctx) => {
    DefaultTheme.enhanceApp(ctx)

    ctx.app.component('CodePreview', CodePreview)
    // ctx.app.component("PageTitle", PageTitle);
  }
}

import { postcssIsolateStyles } from 'vitepress'

export default {
  plugins: [
    // See https://vitepress.dev/guide/markdown#raw
    postcssIsolateStyles({
      includeFiles: [/base\.css/, /vp-doc\.css/]
    })
  ]
}

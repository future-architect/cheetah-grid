
<template>
  <div class="code-preview">
    <div
      v-show="!hiddenCode"
      ref="code"
      class="code-preview__code"
    >
      <slot />
    </div>
    <div
      v-show="!hiddenCode"
      class="code-preview__code"
    >
      <slot name="code-block" />
    </div>
    <div class="code-preview__preview">
      <div class="code-preview__preview-tools">
        <button
          class="material-icons code-preview__icon-button"
          @click="onReplayClick"
        >
          replay
        </button>
        <button
          v-if="hiddenCode"
          class="material-icons code-preview__icon-button"
          @click="onShowCodeClick"
        >
          code
        </button>
      </div>
      <div
        class="code-preview__preview-main"
      >
        <ClientOnly>
          <lazy-draw>
            <preview-block
              v-if="shownPreview"
              :sources="sources"
              :class="$attrs.class"
            />
          </lazy-draw>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, useTemplateRef, ref, defineAsyncComponent, nextTick, computed } from 'vue'

defineOptions({ inheritAttrs: false })

const LazyDraw = defineAsyncComponent(() => import('./LazyDraw.vue'))
const PreviewBlock = defineAsyncComponent(() => import('./PreviewBlock.vue'))

const props = defineProps({
  initMode: {
    type: String,
    default: 'code-and-preview'
  }
})

const codeRoot = useTemplateRef('code')
const sources = ref('')
const shownPreview = ref(true)
const mode = ref(props.initMode)

const hiddenCode = computed(() => {
  if (import.meta.env.SSR) {
    return false
  }
  return !mode.value.includes('code')
})

function composeJsAndHtml (html, js, css) {
  let mainVue = `
<script setup>
import {onMounted,ref,watch,provide} from 'vue'
import InitMain from './$$init_main$$.vue'
const rootElement = ref(null);
const $$fakeDocument$$ = {
  createElement: (...args) => document.createElement(...args),
  querySelector: (...args) => rootElement.value.querySelector(...args),
  querySelectorAll: (...args) => rootElement.value.querySelectorAll(...args),
}
provide('document',  $$fakeDocument$$)
${'<'}/script>
<template>
  <div ref="rootElement">
    ${html}
  </div>
  <template v-if="rootElement"><InitMain/></template>
</template>
`
  if (css) {
    mainVue += `<style>${css}</style>`
  }
  return {
    'Main.vue': mainVue,
    '$$init_main$$.vue': `
<template><!--init--></template>
<script setup>
import { inject } from 'vue'
const document = inject('document')
${js}
${'<'}/script>`
  }
}

onMounted(async () => {
  /** @type {HTMLElement[]} */
  const vpCodeElements = [...codeRoot.value.querySelectorAll('.vp-code')]
  if (vpCodeElements.length === 0) {
    sources.value = { 'Main.vue': '<template>Missing Code Snippet</template>' }
    return
  }
  if (vpCodeElements.length === 2) {
    const html = vpCodeElements.find(el => el.parentElement.classList.contains('language-html'))
    const js = vpCodeElements.find(el => el.parentElement.classList.contains('language-js'))
    if (html && js) {
      sources.value = {
        ...composeJsAndHtml(html.textContent, js.textContent)
      }
      return
    }
  }
  if (vpCodeElements.length === 3) {
    const html = vpCodeElements.find(el => el.parentElement.classList.contains('language-html'))
    const js = vpCodeElements.find(el => el.parentElement.classList.contains('language-js'))
    const css = vpCodeElements.find(el => el.parentElement.classList.contains('language-css'))
    if (html && js && css) {
      sources.value = {
        ...composeJsAndHtml(html.textContent, js.textContent, css.textContent)
      }
      return
    }
  }
  if (vpCodeElements.length === 1) {
    sources.value = { 'Main.vue': vpCodeElements[0].textContent }
    return
  }

  // If the content has multiple code blocks, it expects to use `code-group` to get the name of the file.
  // https://vitepress.dev/guide/markdown#code-groups
  const tabsElement = codeRoot.value.querySelector('.vp-code-group > .tabs')
  const names = tabsElement
    ? [...tabsElement.querySelectorAll('label')].map(label => label.textContent)
    : []

  const files = {}
  for (let index = 0; index < vpCodeElements.length; index++) {
    const element = vpCodeElements[index]

    files[names[index] || `Page-${index + 1}.vue`] = element.textContent
  }

  if (!Object.keys(files).every(key => key.endsWith('.vue'))) {
    if (files['main.js'] && files.HTML && !files['Main.vue']) {
      const js = files['main.js']
      const html = files.HTML
      delete files['main.js']
      delete files.HTML
      Object.assign(files, composeJsAndHtml(html, js))
    }
  }

  // If the file name does not contain Main.vue, the first file will be considered as Main.vue.
  if (!files['Main.vue']) {
    files[Object.keys(files)[0]] = 'Main.vue'
  }

  sources.value = files
})

function onReplayClick () {
  shownPreview.value = false
  nextTick(() => {
    shownPreview.value = true
  })
}

function onShowCodeClick () {
  mode.value = 'code-and-preview'
}
</script>

<style scoped>
.code-preview__preview {
  display: flex;
  flex-direction: column;
}

.code-preview__preview-tools {
  padding: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.code-preview__preview-main {
  flex-grow: 1;
  border: solid 1px var(--vp-c-gutter);
  border-radius: 4px;
  padding: 16px;
  min-height: 200px;
  min-width: 1px;
}

.code-preview__icon-button {
  height: 40px;
  width: 40px;
  border: solid 1px var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px 8px;
  color: rgb(128, 128, 128);
  font-size: 18px;
  transition: border-color 0.25s, background-color 0.25s, opacity 0.25s, color 0.25s;
}

.code-preview__icon-button:hover {
  border-color: var(--vp-c-brand-1);
}
</style>

<template>
  <div class="preview-block">
    <div
      ref="preview"
      class="preview-block__preview vp-raw"
    >
      <!-- vp-raw https://vitepress.dev/guide/markdown#raw -->
      <component
        :is="rootComponent || 'div'"
        :key="key"
      />
    </div>
  </div>
</template>

<script>
import {
  ref,
  onMounted,
  shallowRef,
  useId,
  onBeforeUnmount,
  watch,
  computed,
  useTemplateRef,
  onErrorCaptured
} from 'vue'
import * as compiler from './lib/compiler.mjs'
import * as Vue from 'vue'
import * as cGridAll from '../../../../vue-cheetah-grid/lib/index.js'

const instanceIds = ref([])

</script>

<script setup>
const props = defineProps({
  sources: {
    type: Object,
    default: () => ({})
  }
})
const rootComponent = shallowRef(null)

/** @type {import('vue').Ref<HTMLDivElement>} */
const previewRoot = useTemplateRef('preview')
const styleElement = document.createElement('style')

const key = computed(() => JSON.stringify(props.sources))

const id = useId()

let hasError = false

watch(() => props.sources,
  sources => {
    updateSources(sources)
  },
  {
    deep: true,
    immediate: true
  })
onErrorCaptured((err, instance, info) => {
  console.error(err)
  // eslint-disable-next-line no-restricted-globals
  setTimeout(() => {
    showError([err], instance.$options.__file)
  // eslint-disable-next-line no-magic-numbers
  }, 500)
  return false
})

async function updateSources (sources) {
  hasError = false
  const styles = []
  const modules = {}
  for (const [name, code] of Object.entries(sources)) {
    const isVue = name.toLowerCase().endsWith('.vue')
    const result = isVue
      ? await compiler.compileVue(code, { filename: name, emulateFilter: props.emulateFilter })
      : await compiler.compileJavaScript(code, { filename: name })

    if (result.errors.length) {
      showError(result.errors, name)
      return
    }

    if (result.styles?.length) {
      styles.push(...result.styles)
    }

    let cache
    modules[`./${name}`] = () => {
      if (cache != null) return cache
      try {
        const module = result.build({
          vue: () => Vue,
          'vue-cheetah-grid': () => cGridAll,
          ...modules
        })
        if (isVue) {
          module.default.mixins = [
            ...module.default.mixins || [],
            {
              components: { ...cGridAll }
            }
          ]
        }
        cache = module
        return module
      } catch (error) {
        showError([error], name)
        throw error
      }
    }
  }
  const mainModule = modules['./Main.vue']?.() ?? null
  rootComponent.value = mainModule?.default ?? mainModule

  previewRoot.value.appendChild(styleElement)
  styleElement.innerHTML = `@scope {
${styles.join('\n\n')}
}`
}

onMounted(async () => {
  instanceIds.value.push(id)
})
onBeforeUnmount(() => {
  instanceIds.value = instanceIds.value.filter(i => i !== id)
})

function showError (errors, name) {
  if (hasError) return
  hasError = true
  rootComponent.value = {
    render () {
      return Vue.h(
        'pre',
        {
          style: { color: 'red', fontSize: '11px', whiteSpace: 'pre-wrap' }
        },
            `Error at ${name}

${errors.join('\n--------------------\n')}`
      )
    }
  }
}
</script>

<style scoped>
.preview-block {
  position: relative;
}
</style>

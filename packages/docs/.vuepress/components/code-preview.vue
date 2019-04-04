<template>
  <div
    :class="[
      'code-preview',
      {
        'code-preview--hidden-code': mode === 'preview',
        'code-preview--hidden-preview': mode === 'code'
      }
    ]"
  >
    <div
      ref="code"
      class="code"
    >
      <slot />
    </div>
    <vue-preview
      ref="preview"
      :template="template"
      :js="js"
      :data="data"
    />
    <div
      class="tools"
    >
      <button
        class="material-icons tool-button__code"
        @click="onCodeModeClick"
      >
        code
      </button>
      <button
        class="material-icons tool-button__preview"
        @click="onPreviewModeClick"
      >
        visibility
      </button>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import VuePreview from './vue-preview'

export default {
  name: 'CodePreview',
  components: { VuePreview },
  mixins: [],
  props: {
    initMode: {
      type: String,
      default: 'both'
    },
    data: {
      type:Object,
      default() {
        return {}
      }
    }
  },
  data () {
    return { template: '', js: {}, mode: this.initMode }
  },
  watch: {
    mode () {
      this.$nextTick().then(() => setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
        this.$emit('resize', this.$refs.preview.$refs.root)
      }, 10))
    }
  },
  mounted () {
    this.template = this.$refs.code.querySelector('pre.language-vue, pre.language-html').textContent
    const langJs = this.$refs.code.querySelector('pre.language-js')
    // eslint-disable-next-line palette-vue/no-text-compare
    if (langJs) {
      if (langJs.textContent.includes('export default')) {
        // eslint-disable-next-line no-new-func
        const fn = new Function(`${langJs.textContent.replace('export default', 'const $$$$export = ')}; return $$export;`)
        this.js = fn()
      } else {
        // eslint-disable-next-line no-new-func
        const fn = new Function(`return {
          mounted: function () {
            const vm = this
            const $el = this.$el
            const document = {
              createElement: function() {
                return window.document.createElement.apply(window.document, arguments)
              },
              querySelector: function() {
                return $el.querySelector.apply($el, arguments)
              },
            }
            ${langJs.textContent}
          }
        };`)
        this.js = fn()
      }
    }
  },
  methods: {
    onCodeModeClick () {
      if (this.mode === 'both') {
        this.mode = 'code'
      } else if (this.mode === 'code') {
        this.mode = 'both'
      } else if (this.mode === 'preview') {
        this.mode = 'both'
      }
    },
    onPreviewModeClick () {
      if (this.mode === 'both') {
        this.mode = 'preview'
      } else if (this.mode === 'code') {
        this.mode = 'both'
      } else if (this.mode === 'preview') {
        this.mode = 'both'
      }
    }
  }
}
</script>

<style scoped>
.code-preview {
  display: flex;
  justify-content: space-evenly;
  align-items: stretch;
  position: relative;
}

.code-preview > .code {
  width: 50%;
  padding-right: 4px;
  margin-right: auto;
}

.code-preview > .preview {
  width: 50%;
  padding-left: 4px;
  margin-left: auto;
}

.tools {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0.3;
  z-index: 1;
}

.tools > button {
  cursor: pointer;
  -webkit-appearance: none;
  background-color: white;
  outline: none;
}

.tools:hover {
  opacity: 0.8;
}

.code-preview--hidden-code > .code {
  display: none;
}

.code-preview--hidden-code > .preview {
  width: 100%;
  padding: 0;
}

.code-preview--hidden-preview > .code {
  width: 100%;
  padding: 0;
}

.code-preview--hidden-preview > .preview {
  display: none;
}

.tool-button__code,
.tool-button__preview {
  color: #ff9933;
  font-size: 16px;
}

.code-preview--hidden-code .tool-button__code {
  color: #2c3e50;
}

.code-preview--hidden-preview .tool-button__preview {
  color: #2c3e50;
}

@media (max-width: 1023px) {
  .code-preview {
    flex-direction: column;
  }

  .code-preview > .code {
    width: 100%;
    padding-right: 0;
  }

  .code-preview > .preview {
    width: 100%;
    padding-left: 0;
  }
}
</style>

// @ts-check
import * as compiler from 'vue/compiler-sfc'

/**
 * @typedef {compiler.SFCDescriptor} SFCDescriptor
 */
/**
 * @typedef {object} CompileVueResult
 * @property {string[]} styles style
 * @property {(compiler.CompilerError | SyntaxError)[]} errors error
 * @property {string} [code] script code
 */

let seq = 0
/**
 * @param {string} code
 * @param {object} options params
 * @returns {Promise<CompileVueResult>} result
 */
export async function compileVueToJavaScript (code, { filename }) {
  const id = `palette-doc-preview-${++seq}`
  const { descriptor, errors } = compiler.parse(
    code,
    {
      filename
    }
  )
  if (errors.length) {
    return {
      errors,
      styles: []
    }
  }

  const script = (descriptor.script || descriptor.scriptSetup)
    ? compiler.compileScript(descriptor, {
      id,
      isProd: true,
      sourceMap: false,
      genDefaultAs: '__sfc__'
    })
    : null
  const template = transformTemplateInMain(descriptor, id, script)
  const styles = await transformStyle(descriptor, id)

  const scriptCode = compileToJs({
    script: script ? script.content : 'const __sfc__ = {}',
    template: template ? template.code : `
import { h } from 'vue'  
function _sfc_render() {
    return h('Error: Missing Template')
}`,
    styles,
    id,
    filename
  })

  return {
    code: scriptCode,
    errors: [],
    styles
  }
}
/**
 * @param {SFCDescriptor} descriptor descriptor
 * @param {string} id id
 * @param {compiler.SFCScriptBlock|null} script script
 * @returns {compiler.SFCTemplateCompileResults | null} template script
 */
function transformTemplateInMain (
  descriptor,
  id,
  script
) {
  const scoped = descriptor.styles.some(s => s.scoped)
  const scopeId = `data-v-${id}`
  const template = descriptor.template
    ? compiler.compileTemplate({
      source: descriptor.template.content,
      ast:
        descriptor.template && !descriptor.template.lang
          ? descriptor.template.ast
          : undefined,
      filename: descriptor.filename,
      id,
      isProd: true,
      scoped,
      compilerOptions: {
        scopeId,
        // <script setup>に必要
        bindingMetadata: script ? script.bindings : undefined
      }
    })
    : null
  return template ? {
    ...template,
    code: template.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      '\n$1 _sfc_$2'
    )
  } : null
}

/**
   * @param {SFCDescriptor} descriptor descriptor
   * @param {string} id id
   * @returns {Promise<string[]>} style code list
   */
async function transformStyle (
  descriptor, id
) {
  const results = []
  for (const block of descriptor.styles) {
    const result = await compiler.compileStyleAsync({
      filename: descriptor.filename,
      id: `data-v-${id}`,
      isProd: true,
      source: block.content,
      scoped: block.scoped
    })
    results.push(result.code)
  }
  return results
}

/**
 * Builds a builder that converts each Vue script.
 * @param {object} params
 * @param {string} params.script
 * @param {string} params.template
 * @param {string[]} params.styles style
 * @param {string} params.id id
 * @param {string} params.filename ファイル名
 * @returns {string}
 */
function compileToJs ({ script, template, id, filename }) {
  const code = `${script}
  ${template}
  __sfc__.render = _sfc_render
  __sfc__.__file = ${JSON.stringify(filename)}
  __sfc__.__scopeId = "data-v-${id}"
  export default __sfc__
  `
  return code
}

// @ts-check
import { compileVueToJavaScript } from './compilers/vue.mjs'
import { compileToBuilder } from './compilers/common.mjs'

/**
 * @typedef {object} CompileResult
 * @property {(Error | SyntaxError)[]} errors error
 * @property {string} [output] script code
 * @property {string[]} [styles] style
 * @property {import('./compilers/common.mjs').Builder} [build]
 */

/**
 * Compile vue
 * @param {string} code code to compile
 * @param {object} options option
 * @param {string} options.filename filename
 * @param {boolean} [options.emulateFilter] emulate vue 2 filter option
 * @returns {Promise<CompileResult>} result
 */
export async function compileVue (code, { filename, emulateFilter }) {
  const result = await compileVueToJavaScript(code, { filename, emulateFilter })
  if (result.errors.length) {
    return {
      errors: result.errors
    }
  }

  const builder = compileToBuilder({ code: result.code || '' })
  return {
    build: imports => builder.build(imports),
    output: builder.output,
    styles: result.styles,
    errors: []
  }
}

export function compileJavaScript (code, { filename }) {
  try {
    const builder = compileToBuilder({ code })

    return {
      build: imports => builder.build(imports),
      output: builder.output,
      errors: []
    }
  } catch (e) {
    return {
      errors: [e]
    }
  }
}

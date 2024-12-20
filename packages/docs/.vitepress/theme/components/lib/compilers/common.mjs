// @ts-check
import { transformEsmToFunction } from './javascript.mjs'

/**
 * @typedef {(imports: Record<string, any>)=>unknown} Builder
 */
/**
 * Constructs a builder that translates the script's module syntax.
 * @param {object} params
 * @param {string} params.code
 */
export function compileToBuilder ({ code }) {
  // transform imports
  const output = transformEsmToFunction({ code })

  // eslint-disable-next-line no-new-func
  const builder = new Function('__imports__', output)

  return {
    build: imports => builder(imports),
    output
  }
}

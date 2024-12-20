// @ts-check
import * as babelParser from '@babel/parser'

/**
 * Build a script that converts the script's module syntax.
 * @param {object} params
 * @param {string} params.code
 */
export function transformEsmToFunction ({ code: base }) {
  const code = base
    .replace(/import\((?<p>(?<q>['"]).*?\k<q>)\)/, '__d_import_module__($<p>)')
  // transform imports
  const ast = babelParser.parse(code, {
    sourceType: 'module'
  })
  let start = 0
  let output = `const __exports__ = {};
function __import_module__(path) {
  if (typeof __imports__[path] !== 'function') {
    throw new Error('Module not found: ' + path);
  }
  return __imports__[path]();
}
function __d_import_module__(path) {
  return Promise.resolve(__import_module__(path))
}
`
  for (const body of ast.program.body) {
    if (body.type === 'ImportDeclaration') {
      // Replaces `import x from 'x'`
      output += code.slice(start, body.start || 0)

      const moduleName = JSON.stringify(body.source.value)
      const vars = []
      for (const spec of body.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier') {
          vars.push(`const ${spec.local.name}=__import_module__(${moduleName}).default||__import_module__(${moduleName})`)
        } else if (spec.type === 'ImportSpecifier') {
          const importedName = JSON.stringify(spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value)
          vars.push(`const{${importedName}:${spec.local.name}}=__import_module__(${moduleName})`)
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          vars.push(`const ${spec.local.name}=__import_module__(${moduleName})`)
        }
      }
      output += `\n;\n${vars.join(';\n')};\n`
      start = body.end || start
    } else if (body.type === 'ExportDefaultDeclaration') {
      // Replaces `export default x`
      output += code.slice(start, body.start || 0)

      if (body.declaration.type === 'FunctionDeclaration' || body.declaration.type === 'ClassDeclaration') {
        output += `${code.slice(body.declaration.start || 0, body.end || 0)};\n`
        if (!body.declaration.id) throw new Error('Unexpected export syntax')
        output += `__exports__.default = ${body.declaration.id.name};\n`
      } else {
        output += `__exports__.default = ${code.slice(body.declaration.start || 0, body.end || 0)};\n`
      }
      start = body.end || start
    } else if (body.type === 'ExportAllDeclaration') {
      // Replaces `export * from`
      output += code.slice(start, body.start || 0)

      const moduleName = JSON.stringify(body.source.value)
      output += `Object.assign(__exports__, __import_module__(${moduleName});\n`
      start = body.end || start
    } else if (body.type === 'ExportNamedDeclaration') {
      // Replaces `export * from`
      output += code.slice(start, body.start || 0)

      if (body.declaration) {
        output += `${code.slice(body.declaration.start || 0, body.end || 0)};`
        if (body.declaration.type === 'VariableDeclaration') {
          for (const decl of body.declaration.declarations) {
            if (!decl.init) throw new Error('Unexpected export syntax')

            for (const id of iterateIdentifiers(decl.id)) {
              output += `__exports__.${id} = ${id};\n`
            }
          }
        } else if (body.declaration.type === 'FunctionDeclaration' || body.declaration.type === 'ClassDeclaration') {
          if (!body.declaration.id) throw new Error('Unexpected export syntax')
          output += `__exports__.${body.declaration.id.name} = ${body.declaration.id.name};\n`
        } else {
          throw new Error('Unexpected export syntax')
        }
      } else {
        const sourceModuleName = body.source ? JSON.stringify(body.source.value) : null
        const left = []
        for (const spec of body.specifiers) {
          if (spec.type === 'ExportDefaultSpecifier') {
            left.push(`default: __exports__.${spec.exported.name}`)
          } else if (spec.type === 'ExportSpecifier') {
            const exportedName = JSON.stringify(spec.exported.type === 'Identifier' ? spec.exported.name : spec.exported.value)
            if (sourceModuleName) {
              const localName = JSON.stringify(spec.local.type === 'Identifier' ? spec.local.name
                // @ts-expect-error -- Type bug?
                : spec.local.value)
              left.push(`${localName}: __exports__[${exportedName}]`)
            } else {
              output += `__exports__[${exportedName}] = ${spec.local.name};\n`
            }
          } else if (spec.type === 'ExportNamespaceSpecifier') {
            const exportedName = JSON.stringify(spec.exported.type === 'Identifier' ? spec.exported.name
              // @ts-expect-error -- Type bug?
              : spec.exported.value)
            output += `__exports__[${exportedName}] = __import_module__(${sourceModuleName});\n`
          }
        }
        if (sourceModuleName && left.length) {
          output += `;({${left.join(',')}} = __import_module__(${sourceModuleName}));\n`
        }
      }

      start = body.end || start
    }
  }
  output += code.slice(start)
  output += '\n;\nreturn __exports__;\n'

  return output

  /**
   * @typedef {import('@babel/types').LVal} LVal
   */
  /**
   * @param {LVal} node
   * @returns {Iterable<string>} path
   */
  function * iterateIdentifiers (node) {
    if (node.type === 'Identifier') {
      yield node.name
    } else if (node.type === 'ArrayPattern') {
      for (const element of node.elements) {
        if (!element) continue
        yield * iterateIdentifiers(element)
      }
    } else
      if (node.type === 'ObjectPattern') {
        for (const property of node.properties) {
          if (property.type === 'ObjectProperty') {
            yield * iterateIdentifiers(/** @type {LVal} */ (property.value))
          } else if (property.type === 'RestElement') {
            yield * iterateIdentifiers(property)
          }
        }
      } else if (node.type === 'RestElement') {
        yield * iterateIdentifiers(node.argument)
      } else if (node.type === 'AssignmentPattern') {
        yield * iterateIdentifiers(node.left)
      } else {
        throw new Error('Unexpected export syntax')
      }
  }
}

const path = require('path')
function resolve (arg) {
  return path.resolve(__dirname, arg)
}

module.exports = {
  name: 'cheetah-grid',
  entryPoints: [
    resolve('../cheetah-grid/src/js/main.ts')
  ],
  // theme: 'minimal',
  out: resolve('../../docs/documents/tsdoc'),
  tsconfig: resolve('../cheetah-grid/tsconfig.json'),
  readme: resolve('../../README.md'),
  excludePrivate: true,
  excludeProtected: true,
  // excludeNotExported: true,
  // includeDeclarations: true,
  excludeExternals:true,
  // stripInternal:true,
  // entryPoint: 'cheetah-grid',
  // target: 'ES6',
  // mode: 'modules',
  // mode: 'file',
  // exclude: 'internal/**',
  externalPattern: [
    '**/columns/**',
    '**/header/**',
    '**/tooltip/**',
    '**/GridCanvasHelper.ts',
    '**/element/**',
    // '**/ts-types/**',
    '**/themes/**',
    '**/tools/**',
    '**/get-internal.ts',
    '**/register.ts',
    '**/icons.ts',
    '**/themes.ts',
    // internals
    '**/internal/**',
    '**/ts-types-internal/**'
  ],
  disableSources:true
}

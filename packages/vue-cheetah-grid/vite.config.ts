import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const PACKAGEJSON = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string; license: string };

const BANNER = `/*!
 * vue-cheetah-grid - Cheetah Grid for Vue.js
 * @version v${PACKAGEJSON.version}
 * @license ${PACKAGEJSON.license}
 *
 * [Cheetah Grid](https://github.com/future-architect/cheetah-grid)
 * [Vue.js](https://vuejs.org)
 */`;

function legacyUmdOutputPlugin (): Plugin {
  return {
    name: 'vue-cheetah-grid-legacy-umd-output',
    enforce: 'post',
    generateBundle (_, bundle) {
      const css = Object.entries(bundle)
        .filter(([, chunk]) => chunk.type === 'asset' && chunk.fileName.endsWith('.css'))
        .map(([fileName, chunk]) => {
          delete bundle[fileName];
          return chunk.type === 'asset' ? String(chunk.source) : '';
        })
        .join('\n');

      const cssInjection = css ? `
(function () {
  if (typeof document === 'undefined') return;
  var style = document.createElement('style');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
}());` : '';

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          const sourceMapMatch = chunk.code.match(/\n\/\/# sourceMappingURL=.*$/u);
          const sourceMapComment = sourceMapMatch?.[0] || '';
          const code = sourceMapComment
            ? chunk.code.slice(0, -sourceMapComment.length)
            : chunk.code;
          chunk.code = `${BANNER}\n${code}${cssInjection}${sourceMapComment}`;
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    vue(),
    legacyUmdOutputPlugin()
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  build: {
    lib: {
      entry: resolve(__dirname, './lib/index.js'),
      name: 'vueCheetahGrid',
      formats: ['umd'],
      fileName: () => 'vueCheetahGrid.js'
    },
    sourcemap: true,
    target: 'es2019',
    rollupOptions: {
      external: ['vue', 'cheetah-grid'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'cheetah-grid': 'cheetahGrid'
        }
      }
    }
  }
});

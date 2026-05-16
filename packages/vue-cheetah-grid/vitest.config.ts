import {playwright} from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'node:path';
import {defineConfig} from 'vitest/config';

const browser =
  process.env.VITEST_BROWSER === 'firefox' ||
  process.env.VITEST_BROWSER === 'webkit'
    ? process.env.VITEST_BROWSER
    : 'chromium';
const browserChannel = process.env.VITEST_BROWSER_CHANNEL || (browser === 'chromium' ? 'chrome' : undefined);
const launchOptions = browser === 'chromium' && browserChannel
  ? {channel: browserChannel}
  : undefined;

export default defineConfig({
  plugins: [vue()],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  resolve: {
    alias: {
      'cheetah-grid': resolve(__dirname, '../cheetah-grid/src/js/main.ts'),
      vue: resolve(__dirname, './node_modules/vue/dist/vue.esm-bundler.js')
    }
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')]
    }
  },
  test: {
    globals: true,
    include: ['test/**/*.spec.js'],
    setupFiles: ['test/polyfill.js', 'test/init.js'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(launchOptions ? {launchOptions} : undefined),
      instances: [{browser}]
    },
    coverage: {
      reporter: ['lcov', 'text'],
      reportsDirectory: 'coverage'
    }
  }
});

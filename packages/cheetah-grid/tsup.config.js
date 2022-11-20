'use strict';
const {defineConfig} = require('tsup');

module.exports = defineConfig({
	clean: true,
	dts: true,
	entry: ['./src/js/main.ts'],
	external: [/^@/],
	format: ['cjs'],
	outDir: 'dist0',
});

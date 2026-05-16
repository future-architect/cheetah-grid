/* eslint prettier/prettier: 'off' */
import {readFileSync} from 'node:fs';

import type {Plugin} from 'rolldown';
import {defineConfig} from 'tsdown';

import PACKAGEJSON from './package.json' with {type: 'json'};
const BANNER = `/*! Cheetah Grid v${PACKAGEJSON.version} | license ${PACKAGEJSON.license} */`;

function cssBundlePlugin(): Plugin {
	const cssById = new Map<string, string>();
	return {
		name: 'cheetah-grid-css-bundle',
		load(id: string) {
			if (!id.endsWith('.css')) {
				return null;
			}
			cssById.set(id, readFileSync(id, 'utf8'));
			return {
				code: '',
				moduleSideEffects: true,
			};
		},
		generateBundle() {
			if (!cssById.size) {
				return;
			}
			this.emitFile({
				type: 'asset',
				fileName: 'main.css',
				source: `${BANNER}\n${[...cssById.values()].join('\n')}`,
			});
		},
	};
}

export default defineConfig([
	{
		entry: {'main': './src/js/main.ts'},
		format: ['esm', 'umd'],
		hash: false,
		loader: {'.css': 'empty'},
		plugins: [cssBundlePlugin()],
		outputOptions: {
			name: 'cheetahGrid',
		},
		target: 'es2019',
		banner: {js:BANNER, css:BANNER},
		dts: true
	},
]);

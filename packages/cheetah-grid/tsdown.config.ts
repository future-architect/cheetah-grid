/* eslint prettier/prettier: 'off' */
import {defineConfig} from 'tsdown';

import PACKAGEJSON from './package.json' with {type: 'json'};
const BANNER = `/*! Cheetah Grid v${PACKAGEJSON.version} | license ${PACKAGEJSON.license} */`;

export default defineConfig([
	{
		entry: {'main': './src/js/main.ts'},
		format: ['esm', 'umd'],
		outputOptions: {
			name: 'cheetahGrid',
		},
		target: 'es2020',
		banner: {js:BANNER, css:BANNER},
	},
]);
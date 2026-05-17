'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const copies = [
	['README.md', 'packages/cheetah-grid/README.md'],
	['LICENSE', 'packages/cheetah-grid/LICENSE'],
	['LICENSE', 'packages/vue-cheetah-grid/LICENSE'],
	['LICENSE', 'packages/cheetah-grid-icon-svg-loader/LICENSE'],
	['LICENSE', 'packages/unplugin-cheetah-grid-icon-svg/LICENSE']
];

for (const [from, to] of copies) {
	const source = path.join(rootDir, from);
	const destination = path.join(rootDir, to);
	fs.mkdirSync(path.dirname(destination), {recursive: true});
	fs.copyFileSync(source, destination);
	console.log(`copied ${from} -> ${to}`);
}

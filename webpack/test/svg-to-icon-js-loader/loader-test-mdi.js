/*eslint-disable no-sync*/
'use strict';

const path = require('path');
const mdiRoot = path.dirname(require.resolve('material-design-icons/package.json'));
const loader = require('../../../webpack-loader/svg-to-icon-js-loader');
const UglifyJS = require('uglify-js');
const babel = require('babel-core');

const fs = require('fs');

const walkTree = (p, callback, paths = '') => {
	const list = fs.readdirSync(p);
	for (let i = 0; i < list.length; i++) {
		const n = list[i];
		const f = path.join(p, n);
		const stats = fs.statSync(f);
		if (stats.isFile()) {
			callback(paths, n);
		} else if (stats.isDirectory()) {
			walkTree(f, callback, path.join(paths, n));
		}
	}
};

const svgs = {};

console.log('mdi root: ', mdiRoot);
walkTree(mdiRoot, (dir, filename) => {
	if (path.extname(filename) === '.svg' && filename.startsWith('ic_')) {
		const name = filename.replace(/\.[^/.]+$/, '');
		svgs[name] = path.join('material-design-icons', dir, filename).replace(/\\/g, '/');
	}
});

function transform(file) {
	console.log('mdi svg', file);
	return `
const module = {};
(function(module) {
	${loader.directLoad(file).replace(/\r?\n|\r/g, `
	`)}
})(module);
return module.exports;`;
}

const buildCode = () => {
	let script = `
/*eslint-disable camelcase, max-statements, max-len, no-inner-declarations*/
'use strict';
window.allMdiIcons = {
`;
	for (const name in svgs) {
		script += `
	get '${name}'() {
		${transform(svgs[name]).replace(/\r?\n|\r/g, `
		`)}
	},`;
	}
	script += '\n};';
	return script;
};

const targetPath = path.resolve(__dirname, './all_mdi_icons.js');
const script = buildCode();
const es5 = babel.transform(script, {presets: ['es2015']}).code;
// fs.writeFileSync(targetPath + '.es5.js', es5, 'utf-8');
const minify = UglifyJS.minify(es5).code;

console.log('write: ', targetPath);
fs.writeFileSync(targetPath, minify, 'utf-8');



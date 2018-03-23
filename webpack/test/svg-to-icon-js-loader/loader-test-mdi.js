/*eslint-disable no-sync, handle-callback-err*/
'use strict';

const path = require('path');
const mdiRoot = path.dirname(require.resolve('material-design-icons/package.json'));
const loader = require('../../../webpack-loader/svg-to-icon-js-loader');
const babel = require('babel-core');

const fs = require('fs');

const walkTree = (p, callback, paths = '') => new Promise((resolve) => {
	fs.readdir(p, (err, list) => {
		const results = [];
		const svgs = {};
		for (let i = 0; i < list.length; i++) {
			const n = list[i];
			const f = path.join(p, n);
			const stats = fs.statSync(f);
			if (stats.isFile()) {
				callback(paths, n, svgs);
			} else if (stats.isDirectory()) {
				results.push(walkTree(f, callback, path.join(paths, n)));
			}
		}
		resolve(Promise.all(results).then((results) => {
			results.forEach((data) => {
				for (const k in data) {
					svgs[k] = data[k];
				}
			});
			return svgs;
		}));
	});
});

console.log('mdi root: ', mdiRoot);
const svgsPromise = walkTree(mdiRoot, (dir, filename, svgs) => {
	if (path.extname(filename) === '.svg' && filename.startsWith('ic_')) {
		const name = filename.replace(/\.[^/.]+$/, '');
		svgs[name] = path.join('material-design-icons', dir, filename).replace(/\\/g, '/');
	}
});

function transform(file) {
	return `
const module = {};
(function(module) {
	${loader.directLoad(file).replace(/\r?\n|\r/g, `
	`)}
})(module);
return module.exports;`;
}

const buildCode = (svgs) => {
	const start = Date.now();
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
	const end = Date.now();
	console.log('end', end - start);
	console.log('count', Object.keys(svgs).length);//2069
	return script;
};

const start = Date.now();
svgsPromise.then((svgs) => {
	console.log('findtime:', Date.now() - start);
	const targetPath = path.resolve(__dirname, './all_mdi_icons.js');
	const script = buildCode(svgs);
	const es5 = babel.transform(script, {presets: ['es2015']}).code;

	console.log('write: ', targetPath);
	fs.writeFile(targetPath, es5, 'utf-8');
});



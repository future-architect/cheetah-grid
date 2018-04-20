'use strict';
const vuedoc = require('@vuedoc/md');

const chalk = require('chalk');
const path = require('path');
const readFiles = require('fs-readdir-recursive');
const fs = require('fs');
const rm = require('rimraf');
// const marked = require('marked');

function handleError(message) {
	console.error(`${chalk.red('error')} ${message}`);
		process.exit(1);//eslint-disable-line
}

const vueRoot = path.resolve(path.join(__dirname, '../../../vue-cheetah-grid'));
const files = readFiles(path.join(vueRoot, 'lib'));

if (files.length === 0) {
	handleError('not found vue');
	return;
}


const {getDocumentVersion} = require('../buildcommon');
const docRoot = `../../docs/${getDocumentVersion()}/vuedoc`;

if (!fs.existsSync(docRoot)) { //eslint-disable-line no-sync
	fs.mkdirSync(docRoot); //eslint-disable-line no-sync
}
rm.sync(path.join(docRoot, '*'));

const components = {};
const promise = [];
for (let i = 0; i < files.length; i++) {
	const fileInfo = path.parse(files[i]);
	const filename = path.join(vueRoot, 'lib', fileInfo.dir, fileInfo.base);
	if (/\.vue$/.test(filename)) {
		const docFilename = path.join(docRoot, fileInfo.dir, fileInfo.name);

		promise.push(vuedoc.join({filenames: [filename]}).
			then((component) => {
				components[component.name] = {
					filename,
					docFilename,
					component
				};
			}));

	}
}

Promise.all(promise).then(() => {
	for (const name in components) {
		const {
			docFilename,
			component
		} = components[name];

		const comp = margeComponents([...mixinComponents(component, components), component]);
		vuedoc.render({})(comp).
			then((document) => writeFile(docFilename, document)).
			catch((err) => handleError(err));
	}

});
function mixinComponents(component, components) {
	return component.keywords.filter((k) => k.name === 'mixin').
		map((k) => k.description).
		map((name) => components[name]).
		filter((c) => c).
		map((c) => c.component);
}
function margeComponents(components) {
	const merge = require('deepmerge');
	const c = merge.all(components);
	const props = [];
	c.props.forEach((p) => {
		const idx = props.findIndex((t) => t.name === p.name);
		if (idx >= 0) {
			props.splice(idx, 1);
		}
		props.push(p);
	});
	c.props = props;
	return c;
}

function writeFile(docFilename, md) {
	const dir = path.dirname(docFilename);
	if (!fs.existsSync(dir)) { //eslint-disable-line no-sync
		fs.mkdirSync(dir); //eslint-disable-line no-sync
	}
	fs.writeFile(`${docFilename}.md`, md, (err) => {
		if (err) {
			handleError(err.message);
		}
	});

	// const html = marked(md, {sanitize: true});

	// fs.writeFile(`${docFilename}.html`, html, (err) => {
	// 	if (err) {
	// 		handleError(err.message);
	// 	}
	// });
}



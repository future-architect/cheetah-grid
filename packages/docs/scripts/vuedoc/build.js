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

for (let i = 0; i < files.length; i++) {
	const fileInfo = path.parse(files[i]);
	const filename = path.join(vueRoot, 'lib', fileInfo.dir, fileInfo.base);
	if (/\.vue$/.test(filename)) {
		const docFilename = path.join(docRoot, fileInfo.dir, fileInfo.name);

		const options = {
			filename
		};

		vuedoc.md(options).
			then((document) => writeFile(docFilename, document)).
			catch((err) => handleError(err));
	}
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



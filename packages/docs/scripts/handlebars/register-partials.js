'use strict';
/*eslint no-sync:0*/

const path = require('path');
const readFiles = require('fs-readdir-recursive');
const Handlebars = require('handlebars');

const fs = require('fs');

module.exports = registerPartials;

function registerPartials({dirname, partialsPath}) {
	const partials = readPartials(dirname, partialsPath);
	Handlebars.registerPartial(readPartialFiles(dirname, partials));
}

function readPartials(dirname, partialsPath) {
	const partialsAbs = path.isAbsolute(partialsPath) ? partialsPath : path.join(dirname, partialsPath);
	const files = readFiles(partialsAbs);
	const partials = {};

	// Return early if there are no partials
	if (files.length === 0) {
		return partials;
	}

	// Read and process all partials
	for (let i = 0; i < files.length; i++) {
		const fileInfo = path.parse(files[i]);
		const name = path.join(fileInfo.dir, fileInfo.name);
		const partialAbs = path.join(partialsAbs, fileInfo.dir, fileInfo.base);
		const partialPath = partialAbs;
		partials[name.replace(/\\/g, '/')] = partialPath;
	}

	return partials;
}


function read(path) {
	let str = fs.readFileSync(path, 'utf8');
	str = str.replace(/^\uFEFF/, '');
	return str;
}
function readPartialFiles(metalsmithpath, partials) {
	const result = {};
	for (const key in partials) {
		const file = partials[key];
		result[key] = read(file);
	}
	return result;
}



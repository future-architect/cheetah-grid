'use strict';
const fs = require('fs');
const readFiles = require('fs-readdir-recursive');
const os = require('os');
const isWin = os.platform().startsWith('win');
if (!isWin) {
	return;
}

const {getDocumentVersion} = require('./buildcommon');


const rootDir = `./${getDocumentVersion()}/`;
const files = readFiles(rootDir).
	filter((name) => name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.txt') || name.endsWith('.svg') || name.endsWith('.js'));

for (const file of files) {
	const path = rootDir + file;
	fs.readFile(path, 'utf8', (err, data) => {
		if (err) {
			throw err;
		}
		fs.writeFile(path, data.replace(/\r?\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n'), (err) => {
			if (err) {
				throw err;
			} else {
				// console.log('ファイルが正常に書き出しされました:' + path);
			}
		});
	});
}
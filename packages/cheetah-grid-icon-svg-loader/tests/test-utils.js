/*eslint-disable no-sync*/
'use strict';

const path = require('path');
const fs = require('fs');

const FIXTURES_ROOT = '../test-fixtures';
function resolve(...names) {
	return path.resolve(__dirname, ...names);
}

module.exports = {
	loadExpect(name) {
		const file = path.join(FIXTURES_ROOT, `./expect/${name}`);
		if (!fs.existsSync(file)) { return {}; }
		return require(file);
	},
	saveExpect(name, obj) {
		const text = `var obj=${JSON.stringify(sortProps(obj), null, ' ')}
  if (typeof window !== 'undefined') {
    window['${name}']=obj
  } else {
    module.exports=obj
  }
  `;
		let old;
		try {
			old = fs.readFileSync(resolve(FIXTURES_ROOT, `./expect/${name}.js`), 'utf-8');
		} catch (e) {
			// ignore
		}
		if (old !== text) {
			console.log(`save:${name}`);
			fs.writeFileSync(resolve(FIXTURES_ROOT, `./expect/${name}.js`), text, 'utf-8');
		}
	}
};

function sortProps(obj) {
	return Object.keys(obj).sort().reduce((result, key) => {
		result[key] = obj[key];
		return result;
	}, {});
}
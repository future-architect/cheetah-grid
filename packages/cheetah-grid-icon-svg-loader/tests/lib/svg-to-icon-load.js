/*eslint-disable no-sync*/
'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const loader = require('../..');
const {saveExpect, loadExpect} = require('../test-utils');


const MDI_ROOT = path.join(__dirname, '../../test-fixtures/inputs/node_modules/material-design-icons');
const TEST_TARGETS = [
	'./action/svg/production',
	'./av/svg/design/ic_playlist_play_48px.svg',
	'./toggle/svg/production/ic_star_24px.svg',
	'./toggle/svg/production/ic_star_border_24px.svg',
	'./toggle/svg/production/ic_star_half_24px.svg',
	'./content/svg/production/ic_add_48px.svg',
	'./image/svg/production/ic_edit_48px.svg',
	'./navigation/svg/production/ic_arrow_downward_48px.svg',
	'./navigation/svg/production/ic_arrow_upward_48px.svg',
	'./navigation/svg/production/ic_chevron_left_48px.svg',
	'./navigation/svg/production/ic_chevron_right_48px.svg',
	'./navigation/svg/production/ic_expand_less_48px.svg',
	'./navigation/svg/production/ic_expand_more_48px.svg',
	'./hardware/svg/production/ic_keyboard_arrow_up_48px.svg',
	'./hardware/svg/production/ic_keyboard_arrow_down_48px.svg',
	'./hardware/svg/production/ic_keyboard_arrow_left_48px.svg',
	'./hardware/svg/production/ic_keyboard_arrow_right_48px.svg',
];

const walkTree = (rootDir, callback) => new Promise((resolve) => {
	const stats = fs.statSync(rootDir);
	if (stats.isFile()) {
		const svgs = {};
		callback(rootDir, svgs);
		resolve(svgs);
		return;
	}
	fs.readdir(rootDir, (err, list) => {
		if (err) {
			throw err;
		}
		const results = [];
		const svgs = {};
		for (let i = 0; i < list.length; i++) {
			const n = list[i];
			const f = path.join(rootDir, n);
			const stats = fs.statSync(f);
			if (stats.isFile()) {
				callback(f, svgs);
			} else if (stats.isDirectory()) {
				results.push(walkTree(f, callback));
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

function getAllSvgPaths(rootDir) {
	return 	walkTree(rootDir, (filePath, svgs) => {
		const filename = path.basename(filePath);
		if (path.extname(filename) === '.svg' && filename.startsWith('ic_')) {
			const name = filename.replace(/\.[^/.]+$/, '');
			svgs[name] = filePath.replace(/\\/g, '/');
		}
	});
}


function getAllModule(svgs) {
	const result = {};
	for (const name in svgs) {
		const resultModule = loader.directLoad(svgs[name]);
		const object = eval(resultModule);//eslint-disable-line no-eval
		result[name] = object;
	}
	return result;
}

describe('svg load', () => {
	describe('should succeed loading modules for material-design-icons', () => {
		if (!fs.existsSync(MDI_ROOT)) {
			return;
		}
		for (const target of TEST_TARGETS) {
			it(`@${target}`, () => {
				const dirRoot = path.join(MDI_ROOT, target);
				return getAllSvgPaths(dirRoot).then((svgs) => {
					const result = getAllModule(svgs);
					const name = `material-design-icons${target.replace(/\\|\/|\./g, '_')}`;

					const expect = loadExpect(name);
					saveExpect(name, result);
					assert.deepStrictEqual(result, expect);
				});
			});
		}
	});
});
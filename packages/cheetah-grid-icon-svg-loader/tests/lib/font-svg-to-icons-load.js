/*eslint-disable no-sync*/
'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const loader = require('../..');
const {saveExpect, loadExpect} = require('../test-utils');


const MDI_ROOT = path.join(__dirname, '../../test-fixtures/inputs/node_modules/material-design-icons');


describe('font svg load', () => {
	it('should succeed loading module for MaterialIcons-Regular.svg', () => {
		if (!fs.existsSync(MDI_ROOT)) {
			return;
		}
		const name = 'MaterialIcons-Regular';
		const testPath = path.join(MDI_ROOT, 'iconfont/MaterialIcons-Regular.svg');

		const resultModule = loader.directLoad(testPath);

		const result = eval(resultModule);//eslint-disable-line no-eval
		const expect = loadExpect(name);
		saveExpect(name, result);
		assert.deepStrictEqual(result, expect);
	});

	it('should succeed loading module for fontawesome-webfont.svg', () => {
		const name = 'fontawesome-webfont';
		const resultModule = loader.directLoad(require.resolve('font-awesome/fonts/fontawesome-webfont.svg'));

		const result = eval(resultModule);//eslint-disable-line no-eval
		const expect = loadExpect(name);
		saveExpect(name, result);
		assert.deepStrictEqual(result, expect);
	});
});
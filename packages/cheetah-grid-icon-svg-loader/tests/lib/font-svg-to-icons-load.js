/*eslint-disable no-sync*/
'use strict';

const assert = require('assert');
const loader = require('../..');
const {saveExpect, loadExpect} = require('../test-utils');


const MDI_ROOT = '../../../cheetah-grid/node_modules/material-design-icons';


describe('font svg load', () => {
	it('should succeed loading module for MaterialIcons-Regular.svg', () => {
		const name = 'MaterialIcons-Regular';
		const resultModule = loader.directLoad(require.resolve(`${MDI_ROOT}/iconfont/MaterialIcons-Regular.svg`));

		const result = eval(resultModule);//eslint-disable-line no-eval
		const expect = loadExpect(name);
		assert.deepStrictEqual(result, expect);

		saveExpect(name, result);
	});

	it('should succeed loading module for fontawesome-webfont.svg', () => {
		const name = 'fontawesome-webfont';
		const resultModule = loader.directLoad(require.resolve('font-awesome/fonts/fontawesome-webfont.svg'));

		const result = eval(resultModule);//eslint-disable-line no-eval
		const expect = loadExpect(name);
		assert.deepStrictEqual(result, expect);

		saveExpect(name, result);
	});
});
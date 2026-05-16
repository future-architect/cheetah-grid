/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('column utils', function() {
		it('converts spreadsheet-like false values to booleans', async function() {
			const {toBoolean} = await import('../../../js/columns/utils/index.ts');

			expect(toBoolean(false)).toEqual(false);
			expect(toBoolean(0)).toEqual(false);
			expect(toBoolean(null)).toEqual(false);
			expect(toBoolean(undefined)).toEqual(false);
			expect(toBoolean('false')).toEqual(false);
			expect(toBoolean('off')).toEqual(false);
			expect(toBoolean('0')).toEqual(false);
			expect(toBoolean('000')).toEqual(false);
			expect(toBoolean('true')).toEqual(true);
			expect(toBoolean('on')).toEqual(true);
			expect(toBoolean('1')).toEqual(true);
			expect(toBoolean('001')).toEqual(true);
			expect(toBoolean('FALSE')).toEqual(true);
		});
	});
})();

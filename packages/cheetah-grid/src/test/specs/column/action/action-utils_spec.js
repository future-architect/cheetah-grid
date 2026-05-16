/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('action-utils', function() {
		it('toggles booleans, numbers, and spreadsheet-like strings', async function() {
			const utils = await import('../../../../js/columns/action/action-utils.ts');

			expect(utils.toggleValue(true)).toEqual(false);
			expect(utils.toggleValue(false)).toEqual(true);
			expect(utils.toggleValue(0)).toEqual(1);
			expect(utils.toggleValue(1)).toEqual(0);
			expect(utils.toggleValue('false')).toEqual('true');
			expect(utils.toggleValue('true')).toEqual('false');
			expect(utils.toggleValue('off')).toEqual('on');
			expect(utils.toggleValue('on')).toEqual('off');
			expect(utils.toggleValue('000')).toEqual('001');
			expect(utils.toggleValue('001')).toEqual('000');
			expect(utils.toggleValue('text')).toEqual(false);
		});

		it('uses grid-level disabled and readOnly flags first', async function() {
			const utils = await import('../../../../js/columns/action/action-utils.ts');

			expect(utils.isDisabledRecord(false, {disabled: true}, 0)).toEqual(true);
			expect(utils.isReadOnlyRecord(false, {readOnly: true}, 0)).toEqual(true);
		});

		it('resolves record predicates and treats pending records as unavailable', async function() {
			const utils = await import('../../../../js/columns/action/action-utils.ts');
			const grid = {
				getRowRecord: function(row) {
					return {row, disabled: row === 1};
				},
			};
			const pendingGrid = {
				getRowRecord: function() {
					return Promise.resolve({disabled: false});
				},
			};

			expect(utils.isDisabledRecord(function(record) {
				return record.disabled;
			}, grid, 1)).toEqual(true);
			expect(utils.isDisabledRecord(function(record) {
				return record.disabled;
			}, grid, 2)).toEqual(false);
			expect(utils.isReadOnlyRecord(function(record) {
				return record.disabled;
			}, pendingGrid, 1)).toEqual(true);
		});
	});
})();

/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const types = cheetahGrid.headers.type;
	const styles = cheetahGrid.headers.style;

	describe('header types', function() {
		it('resolves built-in header types by string and falls back to default', function() {
			expect(types.of()).toBe(types.of('unknown'));
			expect(types.of('default')).toBe(types.of());
			expect(types.of('sort')).toBe(types.of('SORT'));
			expect(types.of('check')).toBe(types.of('CHECK'));
			expect(types.of('multilinetext')).toBe(types.of('MULTILINETEXT'));
		});

		it('returns custom header instances unchanged', function() {
			const header = new types.SortHeader();

			expect(types.of(header)).toBe(header);
		});

		it('resolves sorted cells to sort headers before headerType', function() {
			expect(types.ofCell({sort: true, headerType: 'check'})).toBe(types.of('sort'));
			expect(types.ofCell({headerType: 'check'})).toBe(types.of('check'));
			expect(types.ofCell({})).toBe(types.of());
		});

		it('converts and copies header values', function() {
			const header = new types.Header();

			expect(header.convertInternal(function() {
				return 'Name';
			})).toEqual('Name');
			expect(header.convertInternal(null)).toEqual('');
			expect(header.convertInternal(10)).toEqual('10');
			expect(header.getCopyCellValue(function() {
				return 'Copy';
			})).toEqual('Copy');
			expect(header.getCopyCellValue(undefined)).toEqual('');
			expect(header.StyleClass).toBe(styles.Style);
		});

		it('uses specialized style classes for built-in headers', function() {
			expect(new types.SortHeader().StyleClass).toBe(styles.SortHeaderStyle);
			expect(new types.CheckHeader().StyleClass).toBe(styles.CheckHeaderStyle);
			expect(new types.MultilineTextHeader().StyleClass).toBe(styles.MultilineTextHeaderStyle);
		});
	});
})();

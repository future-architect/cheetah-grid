/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const types = cheetahGrid.columns.type;
	const styles = cheetahGrid.columns.style;

	describe('column types', function() {
		it('resolves built-in column types by string and falls back to default', function() {
			expect(types.of()).toBe(types.of('unknown'));
			expect(types.of('default')).toBe(types.of());
			expect(types.of('number')).toBe(types.of('NUMBER'));
			expect(types.of('check')).toBe(types.of('CHECK'));
			expect(types.of('radio')).toBe(types.of('RADIO'));
			expect(types.of('button')).toBe(types.of('BUTTON'));
			expect(types.of('image')).toBe(types.of('IMAGE'));
			expect(types.of('multilinetext')).toBe(types.of('MULTILINETEXT'));
		});

		it('returns custom column instances unchanged', function() {
			const column = new types.NumberColumn();

			expect(types.of(column)).toBe(column);
		});

		it('formats number values and clones with a new format', function() {
			const baseFormat = new Intl.NumberFormat('en-US', {
				maximumFractionDigits: 0,
				useGrouping: false,
			});
			const fractionFormat = new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
				useGrouping: false,
			});
			const originalDefault = types.NumberColumn.defaultFormat;
			const column = new types.NumberColumn({format: baseFormat});

			try {
				types.NumberColumn.defaultFormat = baseFormat;
				expect(types.NumberColumn.defaultFotmat).toBe(baseFormat);
				types.NumberColumn.defaultFotmat = fractionFormat;
				expect(types.NumberColumn.defaultFormat).toBe(fractionFormat);

				expect(column.convertInternal('12.8')).toEqual('13');
				expect(column.convertInternal('text')).toEqual('text');
				expect(column.convertInternal(undefined)).toEqual('');

				const clone = column.withFormat(fractionFormat);
				expect(clone).not.toBe(column);
				expect(column.convertInternal(1)).toEqual('1');
				expect(clone.convertInternal(1)).toEqual('1.00');
				expect(clone.StyleClass).toBe(styles.NumberStyle);
			} finally {
				types.NumberColumn.defaultFormat = originalDefault;
			}
		});

		it('clones button captions and uses captions for copy values', function() {
			const column = new types.ButtonColumn();
			const clone = column.withCaption('Run');

			expect(column.caption).toBeUndefined();
			expect(clone.caption).toEqual('Run');
			expect(column.convertInternal('Value')).toEqual('Value');
			expect(clone.convertInternal('Value')).toEqual('Run');
			expect(column.getCopyCellValue('Value')).toEqual('Value');
			expect(clone.getCopyCellValue('Value')).toEqual('Run');
			expect(clone.StyleClass).toBe(styles.ButtonStyle);
		});

		it('converts check values with spreadsheet-like false strings', function() {
			const column = new types.CheckColumn();

			expect(column.convertInternal(true)).toEqual(true);
			expect(column.convertInternal(1)).toEqual(true);
			expect(column.convertInternal('true')).toEqual(true);
			expect(column.convertInternal('false')).toEqual(false);
			expect(column.convertInternal('off')).toEqual(false);
			expect(column.convertInternal('000')).toEqual(false);
			expect(column.convertInternal('001')).toEqual(true);
			expect(column.StyleClass).toBe(styles.CheckStyle);
		});

		it('converts radio values with spreadsheet-like false strings', function() {
			const column = new types.RadioColumn();

			expect(column.convertInternal(true)).toEqual(true);
			expect(column.convertInternal(1)).toEqual(true);
			expect(column.convertInternal('true')).toEqual(true);
			expect(column.convertInternal('false')).toEqual(false);
			expect(column.convertInternal('off')).toEqual(false);
			expect(column.convertInternal('000')).toEqual(false);
			expect(column.convertInternal('001')).toEqual(true);
			expect(column.StyleClass).toBe(styles.RadioStyle);
		});

		it('converts nullish default column values to empty strings', function() {
			const column = new types.Column();

			expect(column.convertInternal(null)).toEqual('');
			expect(column.convertInternal(undefined)).toEqual('');
			expect(column.convertInternal(0)).toEqual(0);
			expect(column.StyleClass).toBe(styles.Style);
		});
	});
})();

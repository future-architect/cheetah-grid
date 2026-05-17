/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const pasteUtils = cheetahGrid._getInternal().pasteUtils;

	describe('normalizePasteValue', function() {
		for (const {input, output} of [
			{input: '', output: ''},
			{input: 'A', output: 'A'},
			{input: 'A\n', output: 'A'},
			{input: 'A\r\n', output: 'A'},
			{input: 'A\n\n', output: 'A\n'},
			{input: 'A\r\n\r\n', output: 'A\r\n'},
		]) {
			it(input || '<empty>', function() {
				expect(pasteUtils.normalizePasteValue(input)).toEqual(output);
			});
		}
	});

	describe('parsePasteRangeBoxValues', function() {
		for (const {input, output, trimmed} of [
			{input: 'A\tB', output: [['A', 'B']]},
			{input: 'A\tB\nC', output: [['A', 'B'], ['C', '']]},
			{input: 'A\tB\nC\r\nA\tB\n', output: [['A', 'B'], ['C', ''], ['A', 'B']]},
			{input: 'A\n\n', output: [['A'], ['']]},
			{input: 'A\r\n\r\n', output: [['A'], ['']]},
			{input: 'A\tB\tC\n\tD\t\tE\t', output: [['A', 'B', 'C', '', ''], ['', 'D', '', 'E', '']]},
			{input: '  A\t  B  \tC  \nD  \t\t  E', output: [['  A', '  B  ', 'C  '], ['D  ', '', '  E']], trimmed: [['A', 'B', 'C'], ['D', '', 'E']]},
			{input: '"A\tB"\t"C\nD"\nE\tF', output: [['A\tB', 'C\nD'], ['E', 'F']]},
			{input: '"A\tB"\t"C\nD"', output: [['A\tB', 'C\nD']]},
			{input: '  "A\tB"  \t  "C\nD"  \nE\tF', output: [['A\tB', 'C\nD'], ['E', 'F']]},
			{input: '"A""B"\t"C""""D"', output: [['A"B', 'C""D']]},
			{input: '"A"B\tC', output: [['"A"B', 'C']]},
		]) {
			it(input, function() {
				const values = resultToArray(pasteUtils.parsePasteRangeBoxValues(input, {trimOnPaste: false}));
				expect(values).toEqual(output);
			});
			it(`${input} with trim`, function() {
				const values = resultToArray(pasteUtils.parsePasteRangeBoxValues(input, {trimOnPaste: true}));
				expect(values).toEqual(trimmed || output);
			});
		}

		it('fills missing cells with empty strings', function() {
			const values = pasteUtils.parsePasteRangeBoxValues('A\tB\nC', {trimOnPaste: false});

			expect(values.colCount).toEqual(2);
			expect(values.rowCount).toEqual(2);
			expect(values.getCellValue(1, 1)).toEqual('');
			expect(values.getCellValue(2, 0)).toEqual('');
			expect(values.getCellValue(0, 2)).toEqual('');
		});
	});
})();

function resultToArray(ret) {
	const values = [];
	for (let row = 0; row < ret.rowCount; row++) {
		const line = [];
		for (let col = 0; col < ret.colCount; col++) {
			line[col] = ret.getCellValue(col, row);
		}
		values[row] = line;
	}
	return values;
}

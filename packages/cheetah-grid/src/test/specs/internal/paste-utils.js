/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	const pasteUtils = cheetahGrid._getInternal().pasteUtils;

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
		]) {
			it(input, function() {
				const values = resultToArray(pasteUtils.parsePasteRangeBoxValues(input, {}));
				expect(values).toEqual(output);
			});
			it(`${input} with trim`, function() {
				const values = resultToArray(pasteUtils.parsePasteRangeBoxValues(input, {trimOnPaste: true}));
				expect(values).toEqual(trimmed || output);
			});
		}
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
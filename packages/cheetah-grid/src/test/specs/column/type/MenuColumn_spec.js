/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {MenuColumn} = cheetahGrid.columns.type;
	const {MenuStyle} = cheetahGrid.columns.style;

	function createContext() {
		return {
			col: 1,
			row: 2,
		};
	}

	function createHelper(calls) {
		return {
			testFontLoad: function(font, text, context) {
				calls.push(['testFontLoad', font, text, context]);
			},
			toBoxPixelArray: function(padding) {
				if (Array.isArray(padding)) {
					return padding.slice();
				}
				return [padding, padding, padding, padding];
			},
			text: function(text, context, option) {
				calls.push(['text', text, context, option]);
			},
		};
	}

	describe('MenuColumn', function() {
		it('normalizes options and clones with independent options', function() {
			const column = new MenuColumn({
				options: {
					a: 'Alpha',
				},
			});
			const clone = column.withOptions([
				{value: 'b', caption: 'Beta'},
			]);

			expect(column.options).toEqual([{value: 'a', label: 'Alpha'}]);
			expect(clone).not.toBe(column);
			expect(clone.options).toEqual([{value: 'b', caption: 'Beta', label: 'Beta'}]);
			expect(column.getCopyCellValue('a')).toEqual('Alpha');
			expect(column.getCopyCellValue('missing')).toEqual('missing');
			expect(clone.getCopyCellValue('b')).toEqual('Beta');
			expect(clone.StyleClass).toBe(MenuStyle);
		});

		it('draws selected labels and dropdown affordances', function() {
			const calls = [];
			const bases = [];
			const context = createContext();
			const column = new MenuColumn({
				options: {
					a: 'Alpha',
				},
			});

			column.drawInternal('a', context, new MenuStyle({
				appearance: 'menulist-button',
				bgColor: 'base',
				color: 'ink',
				font: '12px sans-serif',
				padding: 2,
				textOverflow: 'ellipsis',
			}), createHelper(calls), {}, {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(bases).toEqual([{bgColor: 'base'}]);
			expect(calls[0]).toEqual(['testFontLoad', '12px sans-serif', 'Alpha', context]);
			expect(calls[1]).toEqual(['text', 'Alpha', context, {
				textAlign: 'left',
				textBaseline: 'middle',
				color: 'ink',
				font: '12px sans-serif',
				padding: [2, 28, 2, 2],
				textOverflow: 'ellipsis',
				icons: undefined,
			}]);
			expect(calls[2]).toEqual(['text', '', context, {
				textAlign: 'right',
				textBaseline: 'middle',
				color: 'ink',
				font: '12px sans-serif',
				icons: [{
					path: 'M0 2 5 7 10 2z',
					width: 10,
					color: 'rgba(0, 0, 0, .54)',
				}],
				padding: [2, 10, 2, 2],
			}]);
		});

		it('uses placeholder color for empty values and skips hidden cells', function() {
			const calls = [];
			const column = new MenuColumn();
			const context = createContext();

			column.drawInternal('', context, new MenuStyle(), createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});
			column.drawInternal('hidden', context, new MenuStyle({
				visibility: 'hidden',
			}), createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});

			expect(calls[1][3].color).toEqual('rgba(0, 0, 0, .38)');
			expect(calls.length).toEqual(3);
		});
	});
})();

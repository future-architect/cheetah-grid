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
	function createInfo(bases) {
		return {
			drawCellBase: function(option) {
				if (bases) {
					bases.push(option);
				}
			},
			getIcon: function() {
				return null;
			},
		};
	}
	function expectSelectedMenuCalls(calls, context) {
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
	}
	function expectPlaceholderMenuCalls(calls, context) {
		expect(calls).toEqual([
			['testFontLoad', undefined, '', context],
			['text', '', context, {
				textAlign: 'left',
				textBaseline: 'middle',
				color: 'rgba(0, 0, 0, .38)',
				font: undefined,
				padding: [0, 26, 0, 0],
				textOverflow: 'clip',
				icons: undefined,
			}],
			['text', '', context, {
				textAlign: 'right',
				textBaseline: 'middle',
				color: 'rgba(0, 0, 0, .38)',
				font: undefined,
				icons: [{
					path: 'M0 2 5 7 10 2z',
					width: 10,
					color: 'rgba(0, 0, 0, .54)',
				}],
				padding: [0, 8, 0, 0],
			}],
		]);
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

			const style = new MenuStyle({
				appearance: 'menulist-button',
				bgColor: 'base',
				color: 'ink',
				font: '12px sans-serif',
				padding: 2,
				textOverflow: 'ellipsis',
			});
			column.drawInternal('a', context, style, createHelper(calls), {}, createInfo(bases));

			expect(bases).toEqual([{bgColor: 'base'}]);
			expectSelectedMenuCalls(calls, context);
		});

		it('uses placeholder color for empty values', function() {
			const calls = [];
			const column = new MenuColumn();
			const context = createContext();

			column.drawInternal('', context, new MenuStyle(), createHelper(calls), {}, createInfo());

			expect(calls.length).toEqual(3);
			expectPlaceholderMenuCalls(calls, context);
		});

		it('skips hidden cells after applying the base draw path only', function() {
			const calls = [];
			const column = new MenuColumn();
			const context = createContext();

			column.drawInternal('hidden', context, new MenuStyle({
				visibility: 'hidden',
			}), createHelper(calls), {}, createInfo());

			expect(calls).toEqual([]);
		});
	});
})();

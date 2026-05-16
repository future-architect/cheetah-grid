/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const types = cheetahGrid.headers.type;
	const styles = cheetahGrid.headers.style;

	function createContext(col, row) {
		return {
			col,
			row,
			getContext: function() {
				return {
					font: '10px sans-serif',
					canvas: {
						style: {
							letterSpacing: '',
						},
					},
					measureText: function() {
						return {width: 10};
					},
				};
			},
		};
	}

	function createGrid() {
		return {
			sortState: {col: 1, row: 0, order: 'asc'},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			getHeaderValue: function() {
				return true;
			},
		};
	}

	function createHelper(calls) {
		return {
			theme: {
				header: {
					sortArrowColor: 'themeSort',
				},
			},
			testFontLoad: function(font, text, context) {
				calls.push(['testFontLoad', font, text, context]);
			},
			getColor: function(color, col, row) {
				return `${color}:${col}:${row}`;
			},
			text: function(text, context, option) {
				calls.push(['text', text, context, option]);
			},
			multilineText: function(lines, context, option) {
				calls.push(['multilineText', lines, context, option]);
			},
			buildCheckBoxInline: function(checked, context, option) {
				const inline = {
					checked,
					context,
					option,
				};
				calls.push(['buildCheckBoxInline', inline]);
				return inline;
			},
		};
	}

	describe('header drawing', function() {
		it('draws multiline default headers', function() {
			const calls = [];
			const bases = [];
			const context = createContext(1, 0);

			new types.Header().drawInternal('A\r\nB\rC', context, new styles.Style({
				multiline: true,
				color: 'ink',
				font: '12px sans-serif',
				padding: 2,
				lineHeight: 16,
				autoWrapText: true,
				lineClamp: 2,
				textOverflow: 'clip',
				bgColor: 'base',
			}), createHelper(calls), createGrid(), {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(bases).toEqual([{bgColor: 'base'}]);
			expect(calls).toEqual([['multilineText', ['A', 'B', 'C'], context, {
				textAlign: 'left',
				textBaseline: 'middle',
				color: 'ink',
				font: '12px sans-serif',
				padding: 2,
				lineHeight: 16,
				autoWrapText: true,
				lineClamp: 2,
				textOverflow: 'clip',
				icons: undefined,
			}]]);
		});

		it('draws sort headers with matching sort arrows', function() {
			const calls = [];
			const context = createContext(1, 0);

			new types.SortHeader().drawInternal('Name', context, new styles.SortHeaderStyle({
				color: 'ink',
				font: '10px sans-serif',
				sortArrowColor: 'sortColor',
				padding: 3,
			}), createHelper(calls), createGrid(), {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});

			expect(calls).toEqual([
				['testFontLoad', '10px sans-serif', 'Name', context],
				['text', 'Name', context, {
					textAlign: 'left',
					textBaseline: 'middle',
					color: 'ink',
					font: '10px sans-serif',
					padding: 3,
					textOverflow: 'ellipsis',
					icons: undefined,
					trailingIcon: {
						name: 'arrow_downward',
						width: 12,
						color: 'sortColor:1:0',
					},
				}],
			]);
		});

		it('draws check headers with checkbox inline state and animation', async function() {
			const {CHECK_HEADER_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const calls = [];
			const context = createContext(1, 2);
			const grid = createGrid();
			grid[CHECK_HEADER_STATE_ID] = {
				elapsed: {'1:2': 0.5},
				block: {},
			};

			new types.CheckHeader().drawInternal(null, context, new styles.CheckHeaderStyle({
				borderColor: 'border',
				checkBgColor: 'checked',
				uncheckBgColor: 'unchecked',
				color: 'ink',
				font: '12px sans-serif',
				padding: 4,
			}), createHelper(calls), grid, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});

			const inline = calls[0][1];
			expect(inline).toEqual({
				checked: true,
				context,
				option: {
					textAlign: 'center',
					textBaseline: 'middle',
					borderColor: 'border',
					checkBgColor: 'checked',
					uncheckBgColor: 'unchecked',
					animElapsedTime: 0.5,
				},
			});
			expect(calls[1][0]).toEqual('text');
			expect(calls[1][1][0]).toBe(inline);
			expect(String(calls[1][1][1])).toEqual('');
			expect(calls[1][2]).toBe(context);
			expect(calls[1][3]).toEqual({
				textAlign: 'center',
				textBaseline: 'middle',
				color: 'ink',
				font: '12px sans-serif',
				padding: 4,
				textOverflow: 'ellipsis',
			});
		});
	});
})();

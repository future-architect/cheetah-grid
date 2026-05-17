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
	function createCheckHeaderStyle(option) {
		return new styles.CheckHeaderStyle(Object.assign({
			borderColor: 'border',
			checkBgColor: 'checked',
			uncheckBgColor: 'unchecked',
			color: 'ink',
			font: '12px sans-serif',
			padding: 4,
		}, option));
	}
	function createDefaultMultilineStyle() {
		return new styles.Style({
			multiline: true,
			color: 'ink',
			font: '12px sans-serif',
			padding: 2,
			lineHeight: 16,
			autoWrapText: true,
			lineClamp: 2,
			textOverflow: 'clip',
			bgColor: 'base',
		});
	}
	function expectDefaultMultilineHeaderCall(calls, context) {
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
	}
	function expectMultilineSortHeaderCall(calls, context) {
		expect(calls).toEqual([
			['testFontLoad', '10px sans-serif', 'A\r\nB', context],
			['multilineText', ['A', 'B'], context, {
				textAlign: 'left',
				textBaseline: 'middle',
				color: 'ink',
				font: '10px sans-serif',
				padding: undefined,
				lineHeight: 16,
				autoWrapText: true,
				lineClamp: 2,
				textOverflow: 'ellipsis',
				icons: undefined,
				trailingIcon: {
					name: 'arrow_upward',
					width: 12,
					color: 'themeSort:1:0',
				},
			}],
		]);
	}
	function expectCheckHeaderTextCall(calls, inline, context) {
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
	}
	function expectSortHeaderCall(calls, context) {
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
	}
	function expectUncheckedCheckHeaderInline(calls, inline) {
		expect(inline.checked).toEqual(false);
		expect(inline.option).toEqual({
			textAlign: 'center',
			textBaseline: 'middle',
			borderColor: 'border',
			checkBgColor: 'checked',
			uncheckBgColor: 'unchecked',
		});
		expect(calls[1][0]).toEqual('text');
		expect(calls[1][1][0]).toBe(inline);
		expect(String(calls[1][1][1])).toEqual('All');
	}
	function expectDedicatedMultilineHeaderCall(calls, context) {
		expect(calls).toEqual([
			['testFontLoad', '11px sans-serif', 'A\nB', context],
			['multilineText', ['A', 'B'], context, {
				textAlign: 'left',
				textBaseline: 'middle',
				color: 'ink',
				font: '11px sans-serif',
				padding: 2,
				lineHeight: 14,
				autoWrapText: true,
				lineClamp: 2,
				textOverflow: 'ellipsis',
				icons: undefined,
			}],
		]);
	}

	describe('header drawing', function() {
		it('draws multiline default headers', function() {
			const calls = [];
			const bases = [];
			const context = createContext(1, 0);

			new types.Header().drawInternal('A\r\nB\rC', context, createDefaultMultilineStyle(), createHelper(calls), createGrid(), {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(bases).toEqual([{bgColor: 'base'}]);
			expectDefaultMultilineHeaderCall(calls, context);
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

			expectSortHeaderCall(calls, context);
		});

		it('draws multiline descending sort headers with themed arrows and background', function() {
			const calls = [];
			const bases = [];
			const context = createContext(1, 0);
			const grid = createGrid();
			grid.sortState = {col: 1, row: 0, order: 'desc'};

			const style = new styles.SortHeaderStyle({
				bgColor: 'base',
				color: 'ink',
				font: '10px sans-serif',
				multiline: true,
				lineHeight: 16,
				autoWrapText: true,
				lineClamp: 2,
			});
			new types.SortHeader().drawInternal('A\r\nB', context, style, createHelper(calls), grid, createInfo(bases));

			expect(bases).toEqual([{bgColor: 'base'}]);
			expectMultilineSortHeaderCall(calls, context);
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

			const style = createCheckHeaderStyle();
			new types.CheckHeader().drawInternal(null, context, style, createHelper(calls), grid, createInfo());

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
			expectCheckHeaderTextCall(calls, inline, context);
		});

		it('draws unchecked check headers with base fill and text content', function() {
			const calls = [];
			const bases = [];
			const context = createContext(1, 2);
			const grid = createGrid();
			grid.getHeaderValue = function() {
				return false;
			};

			new types.CheckHeader().drawInternal('All', context, new styles.CheckHeaderStyle({
				bgColor: 'base',
				borderColor: 'border',
				checkBgColor: 'checked',
				uncheckBgColor: 'unchecked',
				color: 'ink',
				font: '12px sans-serif',
				padding: 4,
			}), createHelper(calls), grid, {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			const inline = calls[0][1];
			expect(bases).toEqual([{bgColor: 'base'}]);
			expectUncheckedCheckHeaderInline(calls, inline);
		});

		it('draws dedicated multiline headers and tests fonts', function() {
			const calls = [];
			const bases = [];
			const context = createContext(1, 0);

			const clone = new types.MultilineTextHeader().clone();
			clone.drawInternal('A\nB', context, new styles.MultilineTextHeaderStyle({
				bgColor: 'base',
				color: 'ink',
				font: '11px sans-serif',
				padding: 2,
				lineHeight: 14,
				autoWrapText: true,
				lineClamp: 2,
			}), createHelper(calls), createGrid(), {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(clone.StyleClass).toBe(styles.MultilineTextHeaderStyle);
			expect(bases).toEqual([{bgColor: 'base'}]);
			expectDedicatedMultilineHeaderCall(calls, context);
		});

		it('uses BaseHeader.onDrawCell to resolve style and draw base cells', function() {
			const bases = [];
			const draws = [];
			const helper = createHelper([]);
			const grid = {
				getGridCanvasHelper: function() {
					return helper;
				},
			};
			class TestHeader extends types.BaseHeader {
				get StyleClass() {
					return styles.Style;
				}
				drawInternal(value, context, style, drawHelper, drawGrid, info) {
					draws.push([value, context, style.color, drawHelper, drawGrid, info]);
				}
			}
			const context = createContext(1, 0);
			const info = {
				style: {color: 'ink'},
				drawCellBase: function(option) {
					bases.push(option || {});
				},
			};

			new TestHeader().onDrawCell(function() {
				return 'Caption';
			}, info, context, grid);

			expect(bases).toEqual([{}]);
			expect(draws).toEqual([['Caption', context, 'ink', helper, grid, info]]);
		});
	});
})();

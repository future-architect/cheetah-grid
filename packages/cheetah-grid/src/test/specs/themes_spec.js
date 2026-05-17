/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {themes} = cheetahGrid;
	const {Theme} = themes.theme;

	function createNestedTheme() {
		const borderColor = function() {
			return [null, 'right', 'bottom', 'left'];
		};
		return new Theme({
			font: '12px sans-serif',
			color: 'ink',
			defaultBgColor: 'paper',
			underlayBackgroundColor: 'underlay',
			borderColor,
		}).extends({
			tree: {
				lineWidth: 3,
			},
			header: {},
			messages: {
				boxWidth: 12,
				markHeight: 5,
			},
			indicators: {
				bottomLeftSize: 7,
			},
		});
	}
	function createBaseTheme() {
		return new Theme({
			font: '12px sans-serif',
			color: 'black',
			defaultBgColor: 'white',
			frozenRowsBgColor: 'silver',
			underlayBackgroundColor: 'transparent',
			borderColor: ['gray', 'darkgray'],
			button: {
				bgColor: 'button-bg',
			},
			messages: {
				infoBgColor: 'info',
				errorBgColor: 'error',
				warnBgColor: 'warn',
				boxWidth: 16,
				markHeight: 4,
			},
		});
	}

	function createFrozenRowsGradientFixture() {
		const gradients = [];
		const context = {
			createLinearGradient: function(left, top, right, bottom) {
				const gradient = {
					left,
					top,
					right,
					bottom,
					stops: [],
					addColorStop: function(stop, color) {
						this.stops.push([stop, color]);
					},
				};
				gradients.push(gradient);
				return gradient;
			},
		};
		const grid = {
			frozenRowCount: 2,
			getRecordIndexByRow: function(row) {
				return row - 2;
			},
			getCellRelativeRect: function(_col, row) {
				return {
					left: 10,
					top: row * 20,
					bottom: row * 20 + 20,
				};
			},
		};
		return {context, gradients, grid};
	}

	describe('themes', function() {
		it('resolves built-in themes by name ignoring case', function() {
			expect(themes.of('basic')).toBe(themes.BASIC);
			expect(themes.of('MATERIAL_DESIGN')).toBe(themes.MATERIAL_DESIGN);
			expect(themes.of('missing')).toEqual(null);
			expect(themes.of()).toEqual(null);
		});

		it('wraps plain theme definitions and returns theme instances unchanged', function() {
			const theme = new Theme({
				font: '12px sans-serif',
				color: 'black',
				defaultBgColor: 'white',
				underlayBackgroundColor: 'transparent',
				borderColor: 'gray',
			});
			const wrapped = themes.of({
				font: '13px sans-serif',
				color: 'blue',
				defaultBgColor: 'white',
				underlayBackgroundColor: 'transparent',
				borderColor: 'gray',
			});

			expect(themes.of(theme)).toBe(theme);
			expect(wrapped).toBeInstanceOf(Theme);
			expect(wrapped.font).toEqual('13px sans-serif');
			expect(wrapped.color).toEqual('blue');
		});

		it('sets and restores the default theme', function() {
			const original = themes.default;
			const custom = new Theme({
				font: '14px sans-serif',
				color: 'black',
				defaultBgColor: 'white',
				underlayBackgroundColor: 'transparent',
				borderColor: 'gray',
			});

			try {
				themes.default = custom;
				expect(themes.default).toBe(custom);

				themes.default = null;
				expect(themes.default).toBe(custom);
			} finally {
				themes.default = original;
			}
		});

		it('extends themes and falls back to parent visual properties', function() {
			const child = createBaseTheme().extends({
				color: 'blue',
				checkbox: {
					uncheckBgColor: 'unchecked',
				},
				indicators: {
					topLeftSize: 8,
				},
			});

			expect(child.font).toEqual('12px sans-serif');
			expect(child.color).toEqual('blue');
			expect(child.button.bgColor).toEqual('button-bg');
			expect(child.checkbox.uncheckBgColor).toEqual('unchecked');
			expect(child.checkbox.borderColor).toEqual('gray');
			expect(child.indicators.topLeftColor).toEqual('gray');
			expect(child.indicators.topLeftSize).toEqual(8);
			expect(child.messages.boxWidth).toEqual(16);
		});

		it('reports whether nested theme properties exist', function() {
			const child = createBaseTheme().extends({
				checkbox: {
					uncheckBgColor: 'unchecked',
				},
			});

			expect(child.hasProperty(['checkbox', 'uncheckBgColor'])).toEqual(true);
			expect(child.hasProperty(['checkbox', 'missing'])).toEqual(false);
		});

		it('derives highlight backgrounds from frozen row state', function() {
			const theme = new Theme({
				font: '12px sans-serif',
				color: 'black',
				defaultBgColor: 'white',
				frozenRowsBgColor: 'silver',
				underlayBackgroundColor: 'transparent',
				borderColor: 'gray',
			});

			expect(theme.highlightBgColor({
				row: 0,
				grid: {frozenRowCount: 1},
			})).toEqual('silver');
			expect(theme.highlightBgColor({
				row: 1,
				grid: {frozenRowCount: 1},
			})).toEqual('white');
		});

		it('evaluates BASIC row backgrounds and caches frozen-row gradients', function() {
			const {context, gradients, grid} = createFrozenRowsGradientFixture();

			expect(themes.BASIC.defaultBgColor({row: 0, grid})).toEqual('#FFF');
			expect(themes.BASIC.defaultBgColor({row: 2, grid})).toEqual('#FFF');
			expect(themes.BASIC.defaultBgColor({row: 3, grid})).toEqual('#F6F6F6');

			const first = themes.BASIC.frozenRowsBgColor({
				col: 1,
				grid,
				context,
			});
			const second = themes.BASIC.frozenRowsBgColor({
				col: 1,
				grid,
				context,
			});

			expect(second).toBe(first);
			expect(gradients).toEqual([{
				left: 10,
				top: 0,
				right: 10,
				bottom: 40,
				stops: [
					[0, '#FFF'],
					[1, '#D3D3D3'],
				],
				addColorStop: gradients[0].addColorStop,
			}]);
		});

		it('evaluates MATERIAL_DESIGN frozen row border callbacks', function() {
			expect(themes.MATERIAL_DESIGN.frozenRowsBorderColor({
				row: 0,
				grid: {frozenRowCount: 2},
			})).toEqual(['#f2f2f2']);
			expect(themes.MATERIAL_DESIGN.frozenRowsBorderColor({
				row: 1,
				grid: {frozenRowCount: 2},
			})).toEqual(['#f2f2f2', '#f2f2f2', '#ccc7c7', '#f2f2f2']);
		});

		it('evaluates MATERIAL_DESIGN body border callbacks for grouped and edge cells', function() {
			const grid = {
				colCount: 4,
				frozenColCount: 2,
				recordRowCount: 2,
				getRecordIndexByRow: function(row) {
					return Math.floor(row / 2);
				},
				getRecordStartRowByRecordIndex: function(index) {
					return index * 2;
				},
			};

			expect(themes.MATERIAL_DESIGN.borderColor({
				col: 0,
				row: 1,
				grid,
			})).toEqual([null, null, '#ccc7c7', null]);
			expect(themes.MATERIAL_DESIGN.borderColor({
				col: 1,
				row: 0,
				grid,
			})).toEqual(['#ccc7c7', '#f2f2f2', null, null]);
			expect(themes.MATERIAL_DESIGN.borderColor({
				col: 3,
				row: 2,
				grid,
			})).toEqual(['#ccc7c7', '#f2f2f2', null, null]);
		});

		it('caches nested theme accessors', function() {
			const child = createNestedTheme();

			expect(child.checkbox).toBe(child.checkbox);
			expect(child.radioButton).toBe(child.radioButton);
			expect(child.tree).toBe(child.tree);
			expect(child.header).toBe(child.header);
			expect(child.messages).toBe(child.messages);
			expect(child.indicators).toBe(child.indicators);
		});

		it('derives nested theme fallbacks for controls', function() {
			const child = createNestedTheme();
			const args = {};

			expect(child.checkbox.checkBgColor(args)).toEqual('right');
			expect(child.checkbox.borderColor(args)).toEqual('right');
			expect(child.radioButton.checkColor).toEqual('ink');
			expect(child.radioButton.uncheckBorderColor(args)).toEqual('right');
			expect(child.radioButton.checkBorderColor(args)).toEqual('right');
			expect(child.radioButton.uncheckBgColor).toEqual('paper');
			expect(child.radioButton.checkBgColor).toEqual('paper');
			expect(child.button.color).toEqual('ink');
			expect(child.button.bgColor).toEqual('paper');
		});

		it('derives nested theme fallbacks for tree, headers, messages, and indicators', function() {
			const child = createNestedTheme();
			const args = {};

			expect(child.tree.lineStyle).toEqual('solid');
			expect(child.tree.lineColor(args)).toEqual('right');
			expect(child.tree.lineWidth).toEqual(3);
			expect(child.header.sortArrowColor).toEqual('ink');
			expect(child.messages.boxWidth).toEqual(12);
			expect(child.messages.markHeight).toEqual(5);
			expect(child.indicators.topRightColor(args)).toEqual('right');
			expect(child.indicators.bottomRightColor(args)).toEqual('right');
			expect(child.indicators.bottomLeftColor(args)).toEqual('right');
			expect(child.indicators.bottomLeftSize).toEqual(7);
		});
	});
})();

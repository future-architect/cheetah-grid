/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const types = cheetahGrid.columns.type;
	const styles = cheetahGrid.columns.style;

	function createContext() {
		return {
			col: 1,
			row: 2,
			getSelection: function() {
				return {
					select: {col: 1, row: 2},
				};
			},
		};
	}

	function createGrid() {
		return {
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
		};
	}

	function createHelper(calls) {
		return {
			testFontLoad: function(font, text, context) {
				calls.push(['testFontLoad', font, text, context]);
			},
			checkbox: function(value, context, option) {
				calls.push(['checkbox', value, context, option]);
			},
			radioButton: function(value, context, option) {
				calls.push(['radioButton', value, context, option]);
			},
			button: function(text, context, option) {
				calls.push(['button', text, context, option]);
			},
			multilineText: function(lines, context, option) {
				calls.push(['multilineText', lines, context, option]);
			},
		};
	}
	function createInfo(getIcon) {
		return {
			drawCellBase: function() {
				// noop
			},
			getIcon: getIcon || function() {
				return null;
			},
		};
	}
	function expectActiveButtonCall(calls, context) {
		expect(calls[0]).toEqual(['testFontLoad', '12px sans-serif', 'Ignored', context]);
		expect(calls[1]).toEqual(['testFontLoad', '12px icon', 'I', context]);
		expect(calls[2][0]).toEqual('button');
		expect(calls[2][1]).toEqual('Ignored');
		expect(calls[2][2]).toBe(context);
		expect(calls[2][3]).toMatchObject({
			bgColor: 'button',
			color: 'ink',
			font: '12px sans-serif',
			padding: 2,
			shadow: {
				color: 'rgba(0, 0, 0, 0.48)',
				blur: 6,
				offsetY: 3,
			},
			textOverflow: 'ellipsis',
			icons: [{
				content: 'I',
				font: '12px icon',
			}],
		});
	}
	function expectCheckControlCall(calls, context) {
		expect(calls).toEqual([[
			'checkbox',
			true,
			context,
			{
				textAlign: 'center',
				textBaseline: 'middle',
				borderColor: 'border',
				checkBgColor: 'checked',
				uncheckBgColor: 'unchecked',
				padding: 3,
				animElapsedTime: 0.25,
			},
		]]);
	}
	function expectRadioControlCall(calls, context) {
		expect(calls).toEqual([[
			'radioButton',
			false,
			context,
			{
				textAlign: 'center',
				textBaseline: 'middle',
				checkColor: 'check',
				uncheckBorderColor: 'uncheckBorder',
				checkBorderColor: 'checkBorder',
				uncheckBgColor: 'uncheckBg',
				checkBgColor: 'checkBg',
				padding: 4,
				animElapsedTime: 0.75,
			},
		]]);
	}
	function expectSelectedButtonCall(calls, context) {
		expect(calls[0]).toEqual(['testFontLoad', undefined, 'Selected', context]);
		expect(calls[1]).toEqual(['button', 'Selected', context, {
			textAlign: 'center',
			textBaseline: 'middle',
			bgColor: 'button-bg',
			color: undefined,
			font: undefined,
			padding: undefined,
			shadow: {
				color: 'rgba(0, 0, 0, 0.48)',
				blur: 6,
				offsetY: 3,
			},
			textOverflow: 'clip',
			icons: undefined,
		}]);
	}
	function expectMultilineTextCall(calls, context) {
		expect(calls).toEqual([
			['testFontLoad', '13px serif', 'A\r\nB\rC', context],
			['multilineText', ['A', 'B', 'C'], context, {
				textAlign: 'left',
				textBaseline: 'top',
				color: 'ink',
				font: '13px serif',
				padding: 2,
				lineHeight: 18,
				autoWrapText: true,
				lineClamp: 2,
				textOverflow: 'clip',
				icons: undefined,
			}],
		]);
	}

	describe('basic column drawing', function() {
		it('draws check controls with animation state', async function() {
			const {CHECK_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const checkCalls = [];
			const bases = [];
			const context = createContext();
			const grid = createGrid();
			grid[CHECK_COLUMN_STATE_ID] = {
				elapsed: {'1:2': 0.25},
			};

			new types.CheckColumn().drawInternal(true, context, new styles.CheckStyle({
				bgColor: 'base',
				borderColor: 'border',
				checkBgColor: 'checked',
				uncheckBgColor: 'unchecked',
				padding: 3,
			}), createHelper(checkCalls), grid, {
				drawCellBase: function(option) {
					bases.push(['check', option]);
				},
			});

			expect(bases).toEqual([
				['check', {bgColor: 'base'}],
			]);
			expectCheckControlCall(checkCalls, context);
		});

		it('draws radio controls with animation state', async function() {
			const {RADIO_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const radioCalls = [];
			const bases = [];
			const context = createContext();
			const grid = createGrid();
			grid[RADIO_COLUMN_STATE_ID] = {
				elapsed: {'1:2': 0.75},
			};

			new types.RadioColumn().drawInternal(false, context, new styles.RadioStyle({
				bgColor: 'base',
				checkColor: 'check',
				uncheckBorderColor: 'uncheckBorder',
				checkBorderColor: 'checkBorder',
				uncheckBgColor: 'uncheckBg',
				checkBgColor: 'checkBg',
				padding: 4,
			}), createHelper(radioCalls), grid, {
				drawCellBase: function(option) {
					bases.push(['radio', option]);
				},
			});

			expect(bases).toEqual([
				['radio', {bgColor: 'base'}],
			]);
			expectRadioControlCall(radioCalls, context);
		});

		it('draws button captions with active state shadows and icons', async function() {
			const {BUTTON_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const calls = [];
			const context = createContext();
			const grid = createGrid();
			grid[BUTTON_COLUMN_STATE_ID] = {
				mouseActiveCell: {col: 1, row: 2},
			};

			const style = new styles.ButtonStyle({
				buttonBgColor: 'button',
				color: 'ink',
				font: '12px sans-serif',
				padding: 2,
				textOverflow: 'ellipsis',
			});
			const info = createInfo(function() {
				return {content: 'I', font: '12px icon'};
			});
			new types.ButtonColumn({caption: 'Run'}).drawInternal('Ignored', context, style, createHelper(calls), grid, info);

			expect(calls.length).toEqual(3);
			expectActiveButtonCall(calls, context);
		});

		it('draws button background and skips caption drawing when hidden', async function() {
			const {BUTTON_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const bases = [];
			const calls = [];
			const context = createContext();
			const grid = createGrid();
			grid[BUTTON_COLUMN_STATE_ID] = {};

			new types.ButtonColumn().drawInternal('Hidden', context, new styles.ButtonStyle({
				bgColor: 'hidden-bg',
				visibility: 'hidden',
			}), createHelper(calls), grid, {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(bases).toEqual([
				{bgColor: 'hidden-bg'},
			]);
			expect(calls).toEqual([]);
		});

		it('draws selected button captions with active state shadows', async function() {
			const {BUTTON_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const bases = [];
			const calls = [];
			const context = createContext();
			const grid = createGrid();
			grid[BUTTON_COLUMN_STATE_ID] = {};

			new types.ButtonColumn().drawInternal('Selected', context, new styles.ButtonStyle({
				bgColor: 'base-bg',
				buttonBgColor: 'button-bg',
			}), createHelper(calls), grid, {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(bases).toEqual([
				{bgColor: 'base-bg'},
			]);
			expectSelectedButtonCall(calls, context);
		});

		it('draws multiline text from normalized line breaks', function() {
			const calls = [];
			const context = createContext();

			new types.MultilineTextColumn().drawInternal('A\r\nB\rC', context, new styles.MultilineTextStyle({
				color: 'ink',
				font: '13px serif',
				padding: 2,
				lineHeight: 18,
				autoWrapText: true,
				lineClamp: 2,
				textOverflow: 'clip',
			}), createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});

			expectMultilineTextCall(calls, context);
		});

		it('draws multiline backgrounds and skips hidden text', function() {
			const calls = [];
			const bases = [];
			const context = createContext();

			new types.MultilineTextColumn().drawInternal('Hidden', context, new styles.MultilineTextStyle({
				bgColor: 'hidden-bg',
				visibility: 'hidden',
			}), createHelper(calls), {}, {
				drawCellBase: function(option) {
					bases.push(option);
				},
				getIcon: function() {
					return null;
				},
			});

			expect(bases).toEqual([{bgColor: 'hidden-bg'}]);
			expect(calls).toEqual([]);
		});
	});
})();

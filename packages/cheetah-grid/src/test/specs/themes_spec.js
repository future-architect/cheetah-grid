/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {themes} = cheetahGrid;
	const {Theme} = themes.theme;

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

		it('extends themes and falls back to parent properties', function() {
			const base = new Theme({
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
			const child = base.extends({
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
	});
})();

/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createDrawerContext(calls) {
		return {
			textAlign: 'left',
			textBaseline: 'top',
			save: function() {
				calls.push(['save']);
			},
			restore: function() {
				calls.push(['restore']);
			},
			beginPath: function() {
				calls.push(['beginPath']);
			},
			rect: function(left, top, width, height) {
				calls.push(['rect', left, top, width, height]);
			},
			clip: function() {
				calls.push(['clip']);
			},
			translate: function(x, y) {
				calls.push(['translate', x, y]);
			},
			scale: function(x, y) {
				calls.push(['scale', x, y]);
			},
			fill: function(path) {
				calls.push(['fill', path instanceof Path2D]);
			},
		};
	}

	function createInlineDrawOptions(ctx) {
		return {
			ctx,
			canvashelper: {},
			rect: {left: 1, top: 2, width: 20, height: 20, right: 21, bottom: 22},
			offset: 0,
			offsetLeft: 0,
			offsetRight: 0,
			offsetTop: 0,
			offsetBottom: 0,
		};
	}

	describe('inlines', function() {
		it('wraps strings and keeps inline instances unchanged', async function() {
			const inlines = await import('../../../js/element/inlines.ts');
			const {Inline} = await import('../../../js/element/Inline.ts');
			const inline = new Inline('Text');

			expect(inlines.of(null)).toEqual(null);
			expect(inlines.of(inline)).toBe(inline);
			expect(`${inlines.of('Text')}`).toEqual('Text');
		});

		it('creates inline icons from icon definitions', async function() {
			const inlines = await import('../../../js/element/inlines.ts');
			const {InlineIcon} = await import('../../../js/element/InlineIcon.ts');
			const {InlinePath2D} = await import('../../../js/element/InlinePath2D.ts');
			const {InlineDrawer} = await import('../../../js/element/InlineDrawer.ts');

			expect(inlines.iconOf(null)).toEqual(null);
			expect(inlines.iconOf({font: '16px sans-serif', content: 'A'})).toBeInstanceOf(InlineIcon);
			expect(inlines.iconOf({path: 'M0 0h1v1z', width: 1, color: 'red'})).toBeInstanceOf(InlinePath2D);
			expect(inlines.iconOf({name: 'arrow_upward', width: 12, color: 'blue'})).toBeInstanceOf(InlineDrawer);
			expect(inlines.iconOf({name: 'missing', content: 'fallback'})).toBeInstanceOf(InlineIcon);
		});

		it('builds inline arrays from icon definitions and text content', async function() {
			const inlines = await import('../../../js/element/inlines.ts');
			const {Inline} = await import('../../../js/element/Inline.ts');
			const existing = new Inline('Existing');
			const result = inlines.buildInlines([
				{font: '16px sans-serif', content: 'I'},
			], ['A', existing, null]);

			expect(result.length).toEqual(3);
			expect(`${result[1]}`).toEqual('A');
			expect(result[2]).toBe(existing);
			expect(inlines.string(['A', existing, 'B'])).toEqual('AExistingB');
		});

		it('draws registered icons through inline drawers', async function() {
			const inlines = await import('../../../js/element/inlines.ts');
			const {InlineDrawer} = await import('../../../js/element/InlineDrawer.ts');
			const iconName = '__test_inline_drawer_icon__';
			const calls = [];
			cheetahGrid.register.icon(iconName, {
				d: 'M0 0h10v10z',
				width: 10,
				height: 10,
			});
			const inline = inlines.iconOf({name: iconName, width: 10});
			const ctx = createDrawerContext(calls);

			expect(inline).toBeInstanceOf(InlineDrawer);
			inline.draw(createInlineDrawOptions(ctx));

			expect(calls).toEqual([
				['save'],
				['beginPath'],
				['rect', 1, 2, 20, 20],
				['clip'],
				['save'],
				['translate', 2, 3],
				['scale', 1, 1],
				['fill', true],
				['restore'],
				['restore'],
			]);
		});
	});
})();

/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createMeasureContext() {
		return {
			measureText: function(text) {
				return {width: String(text).length * 10};
			},
		};
	}

	describe('Inline', function() {
		it('measures, stringifies, and draws text content', async function() {
			const {Inline} = await import('../../../js/element/Inline.ts');
			const inline = new Inline('Hello');
			const drawCalls = [];
			const canvashelper = {
				fillTextRect: function(ctx, text, left, top, width, height, option) {
					drawCalls.push([ctx, text, left, top, width, height, option]);
				},
			};
			const ctx = createMeasureContext();
			const rect = {left: 1, top: 2, width: 30, height: 40, right: 31, bottom: 42};

			inline.draw({
				ctx,
				canvashelper,
				rect,
				offset: 2,
				offsetLeft: 3,
				offsetRight: 4,
				offsetTop: 5,
				offsetBottom: 6,
			});

			expect(inline.width({ctx})).toEqual(50);
			expect(inline.font()).toEqual(null);
			expect(inline.color()).toEqual(null);
			expect(inline.canDraw()).toEqual(true);
			expect(inline.canBreak()).toEqual(true);
			expect(`${inline}`).toEqual('Hello');
			expect(drawCalls).toEqual([[
				ctx,
				'Hello',
				1,
				2,
				30,
				40,
				{
					offset: 3,
					padding: {
						left: 3,
						right: 4,
						top: 5,
						bottom: 6,
					},
				},
			]]);
		});

		it('splits by character index without splitting surrogate pairs', async function() {
			const {Inline} = await import('../../../js/element/Inline.ts');
			const inline = new Inline('A😀BC');
			const result = inline.splitIndex(2);

			expect(`${result.before}`).toEqual('A😀');
			expect(`${result.after}`).toEqual('BC');
			expect(inline.splitIndex(0).before).toEqual(null);
			expect(`${inline.splitIndex(0).after}`).toEqual('A😀BC');
		});

		it('breaks text by words and all characters', async function() {
			const {Inline} = await import('../../../js/element/Inline.ts');
			const ctx = createMeasureContext();
			const inline = new Inline('abc def');
			const word = inline.breakWord(ctx, 35);
			const all = inline.breakAll(ctx, 35);

			expect(`${word.before}`).toEqual('abc');
			expect(`${word.after}`).toEqual('def');
			expect(`${all.before}`).toEqual('abc');
			expect(`${all.after}`).toEqual('def');
		});
	});
})();

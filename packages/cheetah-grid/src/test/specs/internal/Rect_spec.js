/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('Rect', function() {
		it('keeps right and bottom stable when left and top are moved', async function() {
			const {Rect} = await import('../../../js/internal/Rect.ts');
			const rect = new Rect(10, 20, 30, 40);

			rect.left = 15;
			rect.top = 25;

			expect(rect.right).toEqual(40);
			expect(rect.bottom).toEqual(60);
			expect(rect.width).toEqual(25);
			expect(rect.height).toEqual(35);
		});

		it('calculates intersections and misses', async function() {
			const {Rect} = await import('../../../js/internal/Rect.ts');
			const rect = new Rect(10, 20, 30, 40);
			const intersection = rect.intersection(new Rect(30, 50, 20, 20));

			expect(intersection.left).toEqual(30);
			expect(intersection.top).toEqual(50);
			expect(intersection.width).toEqual(10);
			expect(intersection.height).toEqual(10);
			expect(rect.intersection(new Rect(100, 100, 10, 10))).toEqual(null);
		});

		it('creates independent copies and bounding rectangles', async function() {
			const {Rect} = await import('../../../js/internal/Rect.ts');
			const rect = new Rect(10, 20, 30, 40);
			const copy = rect.copy();
			const bounds = Rect.max(rect, Rect.bounds(0, 50, 20, 80));

			copy.offsetLeft(10);
			copy.offsetTop(10);

			expect(rect.left).toEqual(10);
			expect(rect.top).toEqual(20);
			expect(copy.left).toEqual(20);
			expect(copy.top).toEqual(30);
			expect(bounds.left).toEqual(0);
			expect(bounds.top).toEqual(20);
			expect(bounds.right).toEqual(40);
			expect(bounds.bottom).toEqual(80);
		});

		it('checks containment and inclusive points', async function() {
			const {Rect} = await import('../../../js/internal/Rect.ts');
			const rect = new Rect(10, 20, 30, 40);

			expect(rect.contains(new Rect(15, 25, 10, 10))).toEqual(true);
			expect(rect.contains(new Rect(15, 25, 30, 10))).toEqual(false);
			expect(rect.inPoint(10, 20)).toEqual(true);
			expect(rect.inPoint(40, 60)).toEqual(true);
			expect(rect.inPoint(41, 60)).toEqual(false);
		});
	});
})();

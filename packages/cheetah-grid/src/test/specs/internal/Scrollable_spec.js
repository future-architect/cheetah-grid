/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	describe('Scrollable', function() {
		it('creates scroll elements and updates scroll dimensions', async function() {
			const {Scrollable} = await import('../../../js/internal/Scrollable.ts');
			const scrollable = new Scrollable();
			const element = scrollable.getElement();
			const endPoint = element.querySelector('.grid-scroll-end-point');

			scrollable.setScrollSize(200, 300);

			expect(element.classList.contains('grid-scrollable')).toEqual(true);
			expect(endPoint.style.left).toEqual('200px');
			expect(endPoint.style.top).toEqual('300px');
			expect(scrollable.scrollWidth).toEqual(200);
			expect(scrollable.scrollHeight).toEqual(300);
		});

		it('sets scroll positions and calculates absolute tops from relative scroll state', async function() {
			const {Scrollable} = await import('../../../js/internal/Scrollable.ts');
			const scrollable = new Scrollable();
			const element = scrollable.getElement();
			const spacer = document.createElement('div');
			spacer.style.width = '1000px';
			spacer.style.height = '1000px';
			element.style.width = '100px';
			element.style.height = '100px';
			element.style.overflow = 'scroll';
			element.appendChild(spacer);
			document.body.appendChild(element);

			try {
				scrollable.setScrollSize(500, 500);
				scrollable.scrollLeft = 12;
				scrollable.scrollTop = 25;

				expect(scrollable.scrollLeft).toEqual(12);
				expect(scrollable.scrollTop).toEqual(25);
				expect(scrollable.calcTop(40)).toEqual(element.scrollTop + 15);
			} finally {
				element.parentElement.removeChild(element);
				scrollable.dispose();
			}
		});

		it('registers and disposes scroll listeners', async function() {
			const {Scrollable} = await import('../../../js/internal/Scrollable.ts');
			const scrollable = new Scrollable();
			const element = scrollable.getElement();
			let count = 0;

			scrollable.onScroll(function() {
				count++;
			});
			expect(count).toEqual(0);

			element.dispatchEvent(new Event('scroll'));
			expect(count).toEqual(1);

			scrollable.dispose();
			element.dispatchEvent(new Event('scroll'));

			expect(count).toEqual(1);
		});
	});
})();

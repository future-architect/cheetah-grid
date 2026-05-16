/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function withFakeImage(test) {
		const original = Object.getOwnPropertyDescriptor(window, 'Image');
		const created = [];
		class FakeImage {
			constructor() {
				this.width = 24;
				this.height = 12;
				created.push(this);
			}
			set src(src) {
				this._src = src;
				Promise.resolve().then(() => {
					if (this.onload) {
						this.onload();
					}
				});
			}
			get src() {
				return this._src;
			}
		}
		Object.defineProperty(window, 'Image', {
			configurable: true,
			writable: true,
			value: FakeImage,
		});
		return Promise.resolve()
			.then(() => test(created))
			.finally(() => {
				Object.defineProperty(window, 'Image', original);
			});
	}

	describe('imgs', function() {
		it('loads images with the browser Image constructor', async function() {
			const imgs = await import('../../../js/internal/imgs.ts');

			await withFakeImage(async function(created) {
				const image = await imgs.loadImage('image-a.png');

				expect(created.length).toEqual(1);
				expect(image).toBe(created[0]);
				expect(image.src).toEqual('image-a.png');
				expect(image.width).toEqual(24);
			});
		});

		it('caches pending and resolved image loads by cache name and source', async function() {
			const imgs = await import('../../../js/internal/imgs.ts');

			await withFakeImage(async function(created) {
				const first = imgs.getCacheOrLoad('__test_image_cache__', 2, 'same.png');
				const second = imgs.getCacheOrLoad('__test_image_cache__', 2, 'same.png');

				expect(second).toBe(first);
				expect(created.length).toEqual(1);
				expect(await first).toBe(created[0]);
				expect(imgs.getCacheOrLoad('__test_image_cache__', 2, 'same.png')).toBe(created[0]);
			});
		});

		it('uses separate caches for different cache names', async function() {
			const imgs = await import('../../../js/internal/imgs.ts');

			await withFakeImage(async function(created) {
				const first = imgs.getCacheOrLoad('__test_image_cache_a__', 2, 'same.png');
				const second = imgs.getCacheOrLoad('__test_image_cache_b__', 2, 'same.png');

				expect(first).not.toBe(second);
				expect(created.length).toEqual(2);
				expect(await first).toBe(created[0]);
				expect(await second).toBe(created[1]);
			});
		});

		it('accepts promise sources', async function() {
			const imgs = await import('../../../js/internal/imgs.ts');

			await withFakeImage(async function(created) {
				const image = await imgs.getCacheOrLoad(
						'__test_image_promise_src__',
						2,
						Promise.resolve('promise.png')
				);

				expect(created.length).toEqual(1);
				expect(image.src).toEqual('promise.png');
			});
		});
	});
})();

/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createContext(calls) {
		return {
			save: function() {
				calls.push(['save']);
			},
			restore: function() {
				calls.push(['restore']);
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
	function expectedScaledFillCalls() {
		return [
			['save'],
			['translate', 5, 6],
			['scale', 2, 2],
			['translate', 1, 2],
			['fill', true],
			['restore'],
		];
	}

	describe('path2DManager', function() {
		it('fills a path with scaled coordinates and caches Path2D', async function() {
			const path2DManager = await import('../../../js/internal/path2DManager.ts');
			const calls = [];
			const ctx = createContext(calls);
			const path = {
				width: 10,
				height: 20,
				x: 1,
				y: 2,
				d: 'M0 0h10v20z',
			};

			path2DManager.fill(path, ctx, 5, 6, 20, 40);
			const cachedPath = path.path2d;
			expect(calls).toEqual(expectedScaledFillCalls());

			path2DManager.fill(path, ctx, 0, 0, 0, 0);

			expect(path.path2d).toBe(cachedPath);
			expect(calls).toEqual(expectedScaledFillCalls().concat([
				['save'],
				['translate', 0, 0],
				['scale', 1, 1],
				['translate', 1, 2],
				['fill', true],
				['restore'],
			]));
		});

		it('flips upside-down paths around the requested height', async function() {
			const path2DManager = await import('../../../js/internal/path2DManager.ts');
			const calls = [];
			const ctx = createContext(calls);

			path2DManager.fill({
				width: 10,
				height: 20,
				ud: true,
				d: 'M0 0h10v20z',
			}, ctx, 5, 6, 20, 40);

			expect(calls).toEqual([
				['save'],
				['translate', 5, 46],
				['scale', 2, -2],
				['fill', true],
				['restore'],
			]);
		});

		it('restores context even when fill throws', async function() {
			const path2DManager = await import('../../../js/internal/path2DManager.ts');
			const calls = [];
			const ctx = {
				save: function() {
					calls.push('save');
				},
				restore: function() {
					calls.push('restore');
				},
				translate: function() {
					calls.push('translate');
				},
				scale: function() {
					calls.push('scale');
				},
				fill: function() {
					calls.push('fill');
					throw new Error('fill failed');
				},
			};

			expect(function() {
				path2DManager.fill({
					width: 10,
					height: 20,
					d: 'M0 0h10v20z',
				}, ctx, 0, 0, 10, 20);
			}).toThrowError('fill failed');
			expect(calls).toEqual(['save', 'translate', 'scale', 'fill', 'restore']);
		});
	});
})();

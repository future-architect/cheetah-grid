/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off", prefer-template: "off"*/
'use strict';
(function() {
	let mainEl = document.querySelector('#main');
	if (!mainEl) {
		mainEl = document.createElement('div');
		mainEl.id = 'main';
		document.body.appendChild(mainEl);
	}
	const path2DManager = cheetahGrid._getInternal().path2DManager;

	const icons = cheetahGrid.getIcons();

	const canvas = document.createElement('canvas');
	mainEl.appendChild(canvas);
	const width = 700;
	const height = 300;
	const textHeight = 20;
	const iconSize = 48;
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', {alpha: false});
	ctx.beginPath();
	ctx.fillStyle = '#FFF';
	ctx.rect(0, 0, width, height);
	ctx.fill();


	describe('svg to icons', function() {

		it('icons fill', function() {
			ctx.fillStyle = '#555';
			let y = 0;
			let x = 0;
			ctx.textBaseline = 'top';
			Object.keys(icons).forEach(function(k) {
				ctx.fillText(k, x, y);
				ctx.beginPath();
				ctx.strokeStyle = '#ddd';
				ctx.rect(x, y + textHeight, iconSize, iconSize);
				ctx.stroke();
				path2DManager.fill(icons[k], ctx, x, y + textHeight, iconSize, iconSize);
				x += 100;


				if (x > (width - 100)) {
					x = 0;
					y += iconSize;
				}
			});
			expect(true).toBe(true);
		});
	});

})();
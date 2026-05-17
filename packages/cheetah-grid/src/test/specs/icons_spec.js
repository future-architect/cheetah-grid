/*global cheetahGrid*/
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

	const expectedIconNames = [
		'arrow_upward',
		'arrow_downward',
		'edit',
		'add',
		'star',
		'star_border',
		'star_half',
		'keyboard_arrow_down',
		'keyboard_arrow_left',
		'keyboard_arrow_right',
		'keyboard_arrow_up',
		'chevron_left',
		'chevron_right',
		'expand_less',
		'expand_more',
	];

	function drawIcons(iconNames) {
		let y = 0;
		let x = 0;
		ctx.textBaseline = 'top';
		iconNames.forEach(function(k) {
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
	}

	describe('svg to icons', function() {

		it('icons fill', function() {
			ctx.fillStyle = '#555';
			const iconNames = Object.keys(icons);
			drawIcons(iconNames);

			const firstIconPixels = ctx.getImageData(0, textHeight, iconSize, iconSize).data;
			const firstIconHasPaint = Array.prototype.some.call(firstIconPixels, function(value, index) {
				return index % 4 !== 3 && value !== 255;
			});
			expect(iconNames).toEqual(expectedIconNames);
			expect(firstIconHasPaint).toEqual(true);
		});
	});

})();

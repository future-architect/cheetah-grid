/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createContext(calls) {
		return {
			canvas: {
				style: {
					letterSpacing: '',
				},
			},
			font: '__canvashelper_12px__',
			textAlign: 'left',
			textBaseline: 'top',
			fillStyle: '',
			strokeStyle: '',
			lineWidth: 0,
			shadowColor: '',
			shadowBlur: 0,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			measureText: function() {
				return {width: 12};
			},
			save: function() {
				calls.push(['save']);
			},
			restore: function() {
				calls.push(['restore']);
			},
			beginPath: function() {
				calls.push(['beginPath']);
			},
			closePath: function() {
				calls.push(['closePath']);
			},
			rect: function(left, top, width, height) {
				calls.push(['rect', left, top, width, height]);
			},
			clip: function() {
				calls.push(['clip']);
			},
			arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
				calls.push(['arc', x, y, radius, startAngle, endAngle, anticlockwise]);
			},
			moveTo: function(x, y) {
				calls.push(['moveTo', x, y]);
			},
			lineTo: function(x, y) {
				calls.push(['lineTo', x, y]);
			},
			strokeRect: function(left, top, width, height) {
				calls.push(['strokeRect', left, top, width, height, this.strokeStyle]);
			},
			fill: function() {
				calls.push(['fill', this.fillStyle]);
			},
			stroke: function() {
				calls.push(['stroke', this.strokeStyle, this.lineWidth]);
			},
			fillText: function(text, x, y) {
				calls.push(['fillText', text, x, y]);
			},
			drawImage: function(image, srcLeft, srcTop, srcWidth, srcHeight, x, y, width, height) {
				calls.push(['drawImage', image.id, srcLeft, srcTop, srcWidth, srcHeight, x, y, width, height]);
			},
		};
	}

	describe('canvashelper', function() {
		it('strokes uniform, mixed, and empty border colors', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			let calls = [];
			let ctx = createContext(calls);

			canvashelper.strokeColorsRect(ctx, ['red', 'red', 'red', 'red'], 1, 2, 3, 4);
			expect(calls).toEqual([
				['strokeRect', 1, 2, 3, 4, 'red'],
			]);

			calls = [];
			ctx = createContext(calls);
			canvashelper.strokeColorsRect(ctx, ['red', 'blue', null, 'green'], 1, 2, 3, 4);
			expect(calls).toEqual([
				['beginPath'],
				['moveTo', 1, 2],
				['lineTo', 4, 2],
				['stroke', 'red', 0],
				['beginPath'],
				['moveTo', 4, 2],
				['lineTo', 4, 6],
				['stroke', 'blue', 0],
				['beginPath'],
				['moveTo', 1, 6],
				['lineTo', 1, 2],
				['stroke', 'green', 0],
			]);

			calls = [];
			ctx = createContext(calls);
			canvashelper.strokeColorsRect(ctx, [null, null, null, null], 1, 2, 3, 4);
			expect(calls).toEqual([]);
		});

		it('draws rounded rectangles, circles, text, and inline images', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);
			const image = {id: 'image'};

			canvashelper.roundRect(ctx, 10, 20, 30, 40, 5);
			canvashelper.fillRoundRect(ctx, 1, 2, 3, 4, 1);
			canvashelper.strokeRoundRect(ctx, 5, 6, 7, 8, 2);
			canvashelper.fillCircle(ctx, 1, 2, 10, 6);
			canvashelper.strokeCircle(ctx, 1, 2, 4, 8);
			canvashelper.fillTextRect(ctx, 'text', 10, 20, 80, 40, {
				offset: 3,
				padding: {left: 2, top: 4},
			});
			ctx.textAlign = 'right';
			ctx.textBaseline = 'bottom';
			canvashelper.drawInlineImageRect(ctx, image, 1, 2, 3, 4, 12, 10, 10, 20, 80, 40, {
				offset: 3,
				padding: {right: 5, bottom: 6},
			});

			expect(calls.filter(function(call) {
				return call[0] === 'arc';
			}).length).toBeGreaterThanOrEqual(10);
			expect(calls).toContainEqual(['fill', '']);
			expect(calls).toContainEqual(['stroke', '', 0]);
			expect(calls).toContainEqual(['rect', 10, 20, 80, 40]);
			expect(calls).toContainEqual(['clip']);
			expect(calls).toContainEqual(['fillText', 'text', 15, 27]);
			expect(calls).toContainEqual(['drawImage', 'image', 1, 2, 3, 4, 70, 41, 12, 10]);
		});

		it('measures and draws checkboxes, radio buttons, and buttons', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			expect(canvashelper.measureCheckbox(ctx)).toEqual({width: 12});
			expect(canvashelper.measureRadioButton(ctx)).toEqual({width: 12});

			canvashelper.drawCheckbox(ctx, 1.2, 2.3, false, {
				boxSize: 10,
				uncheckBgColor: 'white',
				borderColor: 'black',
			});
			canvashelper.drawCheckbox(ctx, 1.2, 2.3, 0.25, {
				boxSize: 10,
				checkBgColor: 'checked',
				uncheckBgColor: 'mark',
				borderColor: 'border',
			});
			canvashelper.drawCheckbox(ctx, 1.2, 2.3, 2, {
				boxSize: 10,
				checkBgColor: 'checked',
				uncheckBgColor: 'mark',
				borderColor: 'border',
			});
			canvashelper.drawRadioButton(ctx, 5.1, 6.2, false, {
				boxSize: 10,
				bgColor: 'white',
				borderColor: 'black',
			});
			canvashelper.drawRadioButton(ctx, 5.1, 6.2, 0.5, {
				boxSize: 10,
				bgColor: 'white',
				checkColor: 'checked',
				borderColor: 'black',
			});
			canvashelper.drawButton(ctx, 1.2, 2.2, 30.1, 20.1, {
				bgColor: 'button',
				radius: 3,
				shadow: {
					color: 'shadow',
					blur: 4,
					offset: {x: 5, y: 6},
				},
			});
			canvashelper.drawButton(ctx, 1, 2, 3, 4, {
				backgroundColor: 'background',
				shadow: null,
			});

			expect(calls.filter(function(call) {
				return call[0] === 'save';
			}).length).toEqual(7);
			expect(calls.filter(function(call) {
				return call[0] === 'restore';
			}).length).toEqual(7);
			expect(calls).toContainEqual(['fill', 'white']);
			expect(calls).toContainEqual(['fill', 'checked']);
			expect(calls).toContainEqual(['stroke', 'border', 1]);
			expect(calls).toContainEqual(['fill', 'button']);
			expect(ctx.shadowColor).toEqual('shadow');
			expect(ctx.shadowBlur).toEqual(4);
			expect(ctx.shadowOffsetX).toEqual(5);
			expect(ctx.shadowOffsetY).toEqual(6);
		});
	});
})();

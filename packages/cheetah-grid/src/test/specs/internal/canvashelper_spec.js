/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createContext(calls) {
		const states = [];
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
				states.push({
					font: this.font,
					textAlign: this.textAlign,
					textBaseline: this.textBaseline,
					fillStyle: this.fillStyle,
					strokeStyle: this.strokeStyle,
					lineWidth: this.lineWidth,
					shadowColor: this.shadowColor,
					shadowBlur: this.shadowBlur,
					shadowOffsetX: this.shadowOffsetX,
					shadowOffsetY: this.shadowOffsetY,
				});
				calls.push(['save']);
			},
			restore: function() {
				Object.assign(this, states.pop());
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
				if (this.shadowColor || this.shadowBlur || this.shadowOffsetX || this.shadowOffsetY) {
					calls.push([
						'shadow',
						this.shadowColor,
						this.shadowBlur,
						this.shadowOffsetX,
						this.shadowOffsetY,
					]);
				}
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

		it('draws rounded rectangle paths and fill or stroke operations', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			canvashelper.roundRect(ctx, 10, 20, 30, 40, 5);
			expect(calls).toContainEqual(['arc', 15, 25, 5, -Math.PI, -0.5 * Math.PI, false]);

			canvashelper.fillRoundRect(ctx, 1, 2, 3, 4, 1);
			expect(calls).toContainEqual(['fill', '']);

			canvashelper.strokeRoundRect(ctx, 5, 6, 7, 8, 2);
			expect(calls).toContainEqual(['stroke', '', 0]);
		});

		it('draws filled and stroked circles', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			canvashelper.fillCircle(ctx, 1, 2, 10, 6);
			expect(calls).toContainEqual(['arc', 4, 5, 3, 0, 2 * Math.PI, undefined]);
			expect(calls).toContainEqual(['fill', '']);

			canvashelper.strokeCircle(ctx, 1, 2, 4, 8);
			expect(calls).toContainEqual(['arc', 3, 4, 2, 0, 2 * Math.PI, undefined]);
			expect(calls).toContainEqual(['stroke', '', 0]);
		});

		it('clips and draws text inside a padded rectangle', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			canvashelper.fillTextRect(ctx, 'text', 10, 20, 80, 40, {
				offset: 3,
				padding: {left: 2, top: 4},
			});

			expect(calls).toContainEqual(['rect', 10, 20, 80, 40]);
			expect(calls).toContainEqual(['clip']);
			expect(calls).toContainEqual(['fillText', 'text', 15, 27]);
		});

		it('draws inline images with alignment, baseline, padding, and offset', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);
			const image = {id: 'image'};

			ctx.textAlign = 'right';
			ctx.textBaseline = 'bottom';
			canvashelper.drawInlineImageRect(ctx, image, 1, 2, 3, 4, 12, 10, 10, 20, 80, 40, {
				offset: 3,
				padding: {right: 5, bottom: 6},
			});

			expect(calls).toContainEqual(['rect', 10, 20, 80, 40]);
			expect(calls).toContainEqual(['clip']);
			expect(calls).toContainEqual(['drawImage', 'image', 1, 2, 3, 4, 70, 41, 12, 10]);
		});

		it('measures checkbox and radio button inline widths', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			expect(canvashelper.measureCheckbox(ctx)).toEqual({width: 12});
			expect(canvashelper.measureRadioButton(ctx)).toEqual({width: 12});
		});

		it('draws unchecked checkbox state', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			canvashelper.drawCheckbox(ctx, 1.2, 2.3, false, {
				boxSize: 10,
				uncheckBgColor: '#ffffff',
				borderColor: '#000000',
			});

			expect(calls).toContainEqual(['fill', '#ffffff']);
			expect(calls).toContainEqual(['stroke', '#000000', 1]);
			expect(calls).toContainEqual(['save']);
			expect(calls).toContainEqual(['restore']);
		});

		it('draws partial checkbox state', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			canvashelper.drawCheckbox(ctx, 1.2, 2.3, 0.25, {
				boxSize: 10,
				checkBgColor: '#333333',
				uncheckBgColor: '#eeeeee',
				borderColor: '#111111',
			});

			expect(calls).toContainEqual(['fill', '#333333']);
			expect(calls).toContainEqual(['stroke', '#111111', 1]);
			expect(calls).toContainEqual(['stroke', '#eeeeee', 1]);
			expect(calls).toContainEqual(['save']);
			expect(calls).toContainEqual(['restore']);
		});

		it('draws complete checkbox state', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			canvashelper.drawCheckbox(ctx, 1.2, 2.3, 2, {
				boxSize: 10,
				checkBgColor: '#333333',
				uncheckBgColor: '#eeeeee',
				borderColor: '#111111',
			});

			expect(calls).toContainEqual(['fill', '#333333']);
			expect(calls.filter(function(call) {
				return call[0] === 'lineTo';
			}).length).toEqual(2);
			expect(calls).toContainEqual(['save']);
			expect(calls).toContainEqual(['restore']);
		});

		it('draws unchecked and partial radio button states', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			const uncheckedRadioStart = calls.length;
			canvashelper.drawRadioButton(ctx, 5.1, 6.2, false, {
				boxSize: 10,
				bgColor: '#ffffff',
				borderColor: '#000000',
			});
			const uncheckedRadioCalls = calls.slice(uncheckedRadioStart);
			expect(uncheckedRadioCalls).toContainEqual(['fill', '#ffffff']);
			expect(uncheckedRadioCalls).toContainEqual(['stroke', '#000000', 1]);
			const partialRadioStart = calls.length;
			canvashelper.drawRadioButton(ctx, 5.1, 6.2, 0.5, {
				boxSize: 10,
				bgColor: '#ffffff',
				checkColor: '#222222',
				borderColor: '#000000',
			});
			const partialRadioCalls = calls.slice(partialRadioStart);
			expect(partialRadioCalls).toContainEqual(['fill', '#ffffff']);
			expect(partialRadioCalls).toContainEqual(['stroke', '#000000', 1]);
			expect(partialRadioCalls).toContainEqual(['fill', '#222222']);

			expect(calls.filter(function(call) {
				return call[0] === 'save';
			}).length).toEqual(2);
			expect(calls.filter(function(call) {
				return call[0] === 'restore';
			}).length).toEqual(2);
		});

		it('draws buttons with configured background and restored shadow state', async function() {
			const canvashelper = await import('../../../js/tools/canvashelper.ts');
			const calls = [];
			const ctx = createContext(calls);

			const shadowButtonStart = calls.length;
			canvashelper.drawButton(ctx, 1.2, 2.2, 30.1, 20.1, {
				bgColor: '#445566',
				radius: 3,
				shadow: {
					color: '#111111',
					blur: 4,
					offset: {x: 5, y: 6},
				},
			});
			const shadowButtonCalls = calls.slice(shadowButtonStart);
			expect(shadowButtonCalls).toContainEqual(['fill', '#445566']);
			expect(shadowButtonCalls).toContainEqual(['shadow', '#111111', 4, 5, 6]);
			canvashelper.drawButton(ctx, 1, 2, 3, 4, {
				backgroundColor: '#778899',
				shadow: null,
			});

			expect(calls.filter(function(call) {
				return call[0] === 'save';
			}).length).toEqual(2);
			expect(calls.filter(function(call) {
				return call[0] === 'restore';
			}).length).toEqual(2);
			expect(ctx.shadowColor).toEqual('');
			expect(ctx.shadowBlur).toEqual(0);
			expect(ctx.shadowOffsetX).toEqual(0);
			expect(ctx.shadowOffsetY).toEqual(0);
		});
	});
})();

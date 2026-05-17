/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

	function createDrawOption(extraCtx) {
		const calls = [];
		const ctx = Object.assign({
			canvas: {
				style: {
					letterSpacing: '',
				},
			},
			font: '10px sans-serif',
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
			fill: function(path) {
				calls.push(['fill', path instanceof Path2D]);
			},
			measureText: function(text) {
				return {width: String(text).length * 6};
			},
		}, extraCtx || {});
		const canvashelper = {
			fillTextRect: function(ctxArg, text, left, top, width, height, option) {
				calls.push(['fillTextRect', ctxArg === ctx, text, left, top, width, height, option]);
			},
			drawInlineImageRect: function(ctxArg, img, ...args) {
				calls.push(['drawInlineImageRect', ctxArg === ctx, img].concat(args));
			},
		};
		return {
			calls,
			ctx,
			canvashelper,
			rect: {left: 1, top: 2, width: 20, height: 10, right: 21, bottom: 12},
			offset: 0,
			offsetLeft: 1,
			offsetRight: 2,
			offsetTop: 3,
			offsetBottom: 4,
		};
	}
	async function createLoadedInlineImage() {
		const {InlineImage} = await import('../../../js/element/InlineImage.ts');
		const inline = new InlineImage({
			src: IMAGE_SRC,
			imageLeft: 1,
			imageTop: 2,
			imageWidth: 3,
			imageHeight: 4,
		});
		const img = {width: 30, height: 20};
		inline._inlineImg = img;
		return {img, inline};
	}
	function expectInlineIconDrawCall(option) {
		expect(option.calls).toEqual([[
			'fillTextRect',
			true,
			'I',
			1,
			2,
			20,
			10,
			{
				offset: 1,
				padding: {
					left: 6,
					right: 2,
					top: 9,
					bottom: 4,
				},
			},
		]]);
	}

	describe('inline element classes', function() {
		it('draws InlineIcon content with offsets and restores letter spacing', async function() {
			const {InlineIcon} = await import('../../../js/element/InlineIcon.ts');
			const inline = new InlineIcon({
				width: 12,
				content: 'I',
				color: 'red',
				offsetLeft: 5,
				offsetTop: 6,
			});
			const option = createDrawOption();

			expect(inline.width({ctx: option.ctx})).toEqual(12);
			expect(inline.font()).toEqual(null);
			expect(inline.color()).toEqual('red');
			expect(inline.canDraw()).toEqual(true);
			expect(inline.canBreak()).toEqual(false);
			expect(`${inline}`).toEqual('');

			inline.draw(option);

			expect(option.ctx.canvas.style.letterSpacing).toEqual('');
			expectInlineIconDrawCall(option);
		});

		it('measures InlineIcon content with a loaded font', async function() {
			const fonts = await import('../../../js/internal/fonts.ts');
			const {InlineIcon} = await import('../../../js/element/InlineIcon.ts');
			const font = '10px sans-serif';
			const option = createDrawOption();
			const inline = new InlineIcon({
				font,
				content: 'AB',
			});

			await new Promise(function(resolve) {
				fonts.load(font, 'AB', resolve);
			});

			expect(inline.font()).toEqual(font);
			expect(inline.canDraw()).toEqual(true);
			expect(inline.width({ctx: option.ctx})).toEqual(12);
			expect(option.ctx.canvas.style.letterSpacing).toEqual('');
			expect(option.calls).toEqual([
				['save'],
				['restore'],
			]);
		});

		it('draws InlinePath2D using calculated start position and clipping', async function() {
			const {InlinePath2D} = await import('../../../js/element/InlinePath2D.ts');
			const inline = new InlinePath2D({
				path: 'M0 0h10v10z',
				width: 10,
				height: 5,
				color: 'green',
			});
			const option = createDrawOption();

			expect(inline.width({ctx: option.ctx})).toEqual(10);
			expect(inline.font()).toEqual(null);
			expect(inline.color()).toEqual('green');
			expect(inline.canDraw()).toEqual(true);
			expect(inline.canBreak()).toEqual(false);
			expect(`${inline}`).toEqual('');

			inline.draw(option);

			expect(option.calls).toEqual([
				['save'],
				['beginPath'],
				['rect', 1, 2, 20, 10],
				['clip'],
				['translate', 3, 6],
				['fill', true],
				['restore'],
			]);
		});

		it('delegates InlineDrawer drawing and exposes its static metadata', async function() {
			const {InlineDrawer} = await import('../../../js/element/InlineDrawer.ts');
			const drawn = [];
			const option = createDrawOption();
			const inline = new InlineDrawer({
				width: 14,
				height: 7,
				color: 'blue',
				draw: function(drawOption) {
					drawn.push(drawOption);
				},
			});

			expect(inline.width({ctx: option.ctx})).toEqual(14);
			expect(inline.font()).toEqual(null);
			expect(inline.color()).toEqual('blue');
			expect(inline.canDraw()).toEqual(true);
			expect(inline.canBreak()).toEqual(false);
			expect(`${inline}`).toEqual('');

			inline.draw(option);

			expect(drawn).toEqual([{
				ctx: option.ctx,
				canvashelper: option.canvashelper,
				rect: option.rect,
				offset: 0,
				offsetLeft: 1,
				offsetRight: 2,
				offsetTop: 3,
				offsetBottom: 4,
			}]);
		});

		it('reports InlineImage size and metadata from the loaded image', async function() {
			const {inline} = await createLoadedInlineImage();
			const option = createDrawOption();

			expect(inline.width({ctx: option.ctx})).toEqual(30);
			expect(inline.font()).toEqual(null);
			expect(inline.color()).toEqual(null);
			expect(inline.canDraw()).toEqual(true);
			expect(inline.canBreak()).toEqual(false);
			expect(`${inline}`).toEqual('');
		});

		it('draws InlineImage from the loaded image', async function() {
			const {img, inline} = await createLoadedInlineImage();
			const option = createDrawOption();

			inline.draw(option);

			expect(option.calls).toEqual([[
				'drawInlineImageRect',
				true,
				img,
				1,
				2,
				3,
				4,
				30,
				20,
				1,
				2,
				20,
				10,
				{
					offset: 1,
					padding: {
						left: 1,
						right: 2,
						top: 3,
						bottom: 4,
					},
				},
			]]);
		});

		it('uses explicit InlineImage dimensions before an image is loaded', async function() {
			const {InlineImage} = await import('../../../js/element/InlineImage.ts');
			const inline = new InlineImage({
				src: new Promise(function() {}),
				width: 11,
				height: 9,
			});
			let ready = 0;

			inline.onReady(function() {
				ready++;
			});

			expect(inline.width({ctx: createDrawOption().ctx})).toEqual(11);
			expect(inline.canDraw()).toEqual(false);
			expect(ready).toEqual(0);
		});

		it('derives InlineSvg dimensions from svg markup', async function() {
			const {InlineSvg} = await import('../../../js/element/InlineSvg.ts');
			const fromString = new InlineSvg({
				svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12"></svg>',
			});
			const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			element.setAttribute('width', '8');
			element.setAttribute('height', '6');
			const fromElement = new InlineSvg({
				svg: element,
				width: 10,
				height: 5,
			});
			const option = createDrawOption();

			expect(fromString.width({ctx: option.ctx})).toEqual(16);
			expect(fromString.canBreak()).toEqual(false);
			expect(`${fromString}`).toEqual('');
			expect(fromElement.width({ctx: option.ctx})).toEqual(10);
		});
	});
})();

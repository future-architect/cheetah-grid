/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", max-len: "off", prefer-destructuring:"off"*/
'use strict';
(function() {
	let mainEl = document.querySelector('#main');
	if (!mainEl) {
		mainEl = document.createElement('div');
		mainEl.id = 'main';
		document.body.appendChild(mainEl);
	}

	const records = [
		{bool: false, str: 'false', onoff: 'off', num: 0, numstr: '00'},
		{bool: false, str: 'false', onoff: 'off', num: 0, numstr: '000'},
	];
	const style = {};
	const action = new cheetahGrid.columns.action.CheckEditor();

	const grid = new cheetahGrid.ListGrid({
		parentElement: (function() {
			const parent = document.createElement('div');
			parent.id = 'parent';
			parent.style.width = '500px';
			parent.style.height = '300px';
			mainEl.appendChild(parent);
			return parent;
		})(),
		defaultRowHeight: 24,
		header: [
			{field: 'bool', caption: 'bool', width: 50, columnType: 'check', style: style, action: action},
			{field: 'str', caption: 'str', width: 50, columnType: 'check', style: style, action: action},
			{field: 'onoff', caption: 'onoff', width: 50, columnType: 'check', style: style, action: action},
			{field: 'num', caption: 'num', width: 50, columnType: 'check', style: style, action: action},
			{field: 'numstr', caption: 'nstr', width: 50, columnType: 'check', style: style, action: action},
		],
		records: records,
	});
	window.gridElement = grid.getElement();
	window.grid = grid;
	const theme = {};
	theme.frozenRowsBgColor = '#d3d3d3';
	grid.theme = cheetahGrid.themes.choices.BASIC.extends(theme);


	describe('CheckStyle', function() {

		function createAnswerCanvasBase() {
			const rows = [24, 24, 24];
			const cols = [50, 50, 50, 50, 50];

			const canvasHelper = window.createCanvasHelper(grid.canvas.width, grid.canvas.height);
			const ctx = canvasHelper.context;
			ctx.font = '16px sans-serif';

			const gridHelper = canvasHelper.createGridHelper(cols, rows);

			//塗りつぶし
			canvasHelper.fillRect('#f6f6f6');
			gridHelper.fillRect('white');
			gridHelper.fillRect('#d3d3d3', 0, 0, null, 0);
			gridHelper.fillRect('#f6f6f6', 0, 2, null, 2);

			//罫線
			gridHelper.lineAll(1);
			ctx.strokeStyle = '#5e9ed6';
			gridHelper.lineH(1, 0, 0, 0);
			gridHelper.lineH(2, 0, 0, 0, true);
			gridHelper.lineV(1, 0, 0, 0);
			gridHelper.lineV(2, 0, 0, 0, true);

			//TEXT
			ctx.fillStyle = '#000';
			const textOpt = {
				offset: 3,
				textBaseline: 'middle',
				textAlign: 'left',
			};
			gridHelper.text('bool', 0, 0, textOpt);
			gridHelper.text('str', 1, 0, textOpt);
			gridHelper.text('onoff', 2, 0, textOpt);
			gridHelper.text('num', 3, 0, textOpt);
			gridHelper.text('nstr', 4, 0, textOpt);

			return {
				canvasHelper: canvasHelper,
				gridHelper: gridHelper,
			};

		}

		it('init drawing', function(done) {
			function createAnswerCanvas() {

				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;

				const gridHelper = base.gridHelper;

				for (let col = 0; col < 5; col++) {
					const rect = gridHelper.getRect(col, 1);
					const boxSize = cheetahGrid.tools.canvashelper.measureCheckbox(ctx).width;
					const offsetX = Math.floor((50 - boxSize) / 2);
					const offsetY = Math.floor((24 - boxSize) / 2);
					cheetahGrid.tools.canvashelper.drawCheckbox(
							ctx, rect.left + offsetX, rect.top + offsetY, false, {}
					);
					cheetahGrid.tools.canvashelper.drawCheckbox(
							ctx, rect.left + offsetX, rect.bottom + offsetY, false, {}
					);
				}

				return canvasHelper.canvas;
			}
			const canvas = createAnswerCanvas();
			setTimeout(function() {
				expect(grid.canvas).toMatchImage(canvas, {tolerance: 50, delta: '15%', blurLevel: 1});
				done();
			}, 200);

		});

		it('toggle', function(done) {
			grid.selection.select = {col: 0, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 0, row: 1});
			grid.selection.select = {col: 1, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 1, row: 1});
			grid.selection.select = {col: 2, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 2, row: 1});
			grid.selection.select = {col: 3, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 3, row: 1});
			grid.selection.select = {col: 4, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 4, row: 1});
			grid.selection.select = {col: 0, row: 0};

			expect(records[0]).toEqual({bool: true, str: 'true', onoff: 'on', num: 1, numstr: '01'});

			expect(grid.fireListeners('copydata', {
				start: {
					col: 0,
					row: 0,
				},
				end: {
					col: 4,
					row: 2,
				},
			})).toEqual([
				'bool	str	onoff	num	nstr\n' +
				'true	true	on	1	01\n' +
				'false	false	off	0	000'
			]);


			setTimeout(function() {
				function createAnswerCanvas() {

					const base = createAnswerCanvasBase();
					const canvasHelper = base.canvasHelper;
					const ctx = canvasHelper.context;
					const canvas = canvasHelper.canvas;

					const gridHelper = base.gridHelper;

					for (let col = 0; col < 5; col++) {
						const rect = gridHelper.getRect(col, 1);
						const boxSize = cheetahGrid.tools.canvashelper.measureCheckbox(ctx).width;
						const offsetX = Math.floor((50 - boxSize) / 2);
						const offsetY = Math.floor((24 - boxSize) / 2);
						cheetahGrid.tools.canvashelper.drawCheckbox(
								ctx, rect.left + offsetX, rect.top + offsetY, true, {}
						);
						cheetahGrid.tools.canvashelper.drawCheckbox(
								ctx, rect.left + offsetX, rect.bottom + offsetY, false, {}
						);
					}

					return canvas;
				}
				const canvas = createAnswerCanvas();
				expect(grid.canvas).toMatchImage(canvas, {tolerance: 110, delta: '15%', blurLevel: 1});

				done();

			}, 300);
		});
		it('toggle2', function(done) {
			const e = {
				preventDefault: function() {
				},
				stopPropagation: function() {
				},
			};
			grid.selection.select = {
				col: 0,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 13, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 1,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 32, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 2,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 13, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 3,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 32, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 4,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 13, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 0,
				row: 0,
			};

			expect(records[0]).toEqual({bool: false, str: 'false', onoff: 'off', num: 0, numstr: '00'});

			setTimeout(function() {
				done();
			}, 300);
		});
		it('readonly toggle', function() {
			action.readOnly = true;

			const e = {
				preventDefault: function() {
				},
				stopPropagation: function() {
				},
			};

			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 0, row: 1});
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 1, row: 1});
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 2, row: 1});
			grid.selection.select = {
				col: 3,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 32, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 4,
				row: 1,
			};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.KEYDOWN, {keyCode: 13, event: e, stopCellMoving() {}});
			grid.selection.select = {
				col: 0,
				row: 0,
			};

			expect(records[0]).toEqual({bool: false, str: 'false', onoff: 'off', num: 0, numstr: '00'});

		});
		it('uncheckBgColor', function() {
			style.uncheckBgColor = 'red';
			grid.invalidate();


			function createAnswerCanvas() {

				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = base.gridHelper;

				for (let col = 0; col < 5; col++) {
					const rect = gridHelper.getRect(col, 1);
					const boxSize = cheetahGrid.tools.canvashelper.measureCheckbox(ctx).width;
					const offsetX = Math.floor((50 - boxSize) / 2);
					const offsetY = Math.floor((24 - boxSize) / 2);
					const opt = {
						uncheckBgColor: '#F00'
					};
					cheetahGrid.tools.canvashelper.drawCheckbox(ctx, rect.left + offsetX, rect.top + offsetY, false, opt);
					cheetahGrid.tools.canvashelper.drawCheckbox(ctx, rect.left + offsetX, rect.bottom + offsetY, false, opt);
				}

				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {tolerance: 50, delta: '10%', blurLevel: 1});
		});
		it('checkBgColor', function(done) {
			action.readOnly = false;
			style.checkBgColor = '#0f0';
			grid.selection.select = {col: 0, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 0, row: 1});
			grid.selection.select = {col: 1, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 1, row: 1});
			grid.selection.select = {col: 2, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 2, row: 1});
			grid.selection.select = {col: 3, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 3, row: 1});
			grid.selection.select = {col: 4, row: 1};
			grid.fireListeners(cheetahGrid.ListGrid.EVENT_TYPE.CLICK_CELL, {col: 4, row: 1});
			grid.selection.select = {col: 0, row: 0};


			setTimeout(function() {
				function createAnswerCanvas() {

					const base = createAnswerCanvasBase();
					const canvasHelper = base.canvasHelper;
					const ctx = canvasHelper.context;
					const canvas = canvasHelper.canvas;

					const gridHelper = base.gridHelper;

					for (let col = 0; col < 5; col++) {
						const rect = gridHelper.getRect(col, 1);
						const boxSize = cheetahGrid.tools.canvashelper.measureCheckbox(ctx).width;
						const offsetX = Math.floor((50 - boxSize) / 2);
						const offsetY = Math.floor((24 - boxSize) / 2);

						const opt = {
							uncheckBgColor: '#F00',
							checkBgColor: '#0F0',
						};
						cheetahGrid.tools.canvashelper.drawCheckbox(ctx, rect.left + offsetX, rect.top + offsetY, true, opt);
						cheetahGrid.tools.canvashelper.drawCheckbox(
								ctx, rect.left + offsetX, rect.bottom + offsetY, false, opt
						);
					}

					return canvas;
				}
				const canvas = createAnswerCanvas();
				expect(grid.canvas).toMatchImage(canvas, {tolerance: 100, delta: '20%', blurLevel: 1});

				done();

			}, 300);
		});
		it('borderColor', function() {
			style.borderColor = '#00F';
			grid.invalidate();


			function createAnswerCanvas() {

				const base = createAnswerCanvasBase();
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;
				const canvas = canvasHelper.canvas;

				const gridHelper = base.gridHelper;

				for (let col = 0; col < 5; col++) {
					const rect = gridHelper.getRect(col, 1);
					const boxSize = cheetahGrid.tools.canvashelper.measureCheckbox(ctx).width;
					const offsetX = Math.floor((50 - boxSize) / 2);
					const offsetY = Math.floor((24 - boxSize) / 2);
					const opt = {
						uncheckBgColor: '#F00',
						checkBgColor: '#0F0',
						borderColor: '#00F',
					};
					cheetahGrid.tools.canvashelper.drawCheckbox(ctx, rect.left + offsetX, rect.top + offsetY, true, opt);
					cheetahGrid.tools.canvashelper.drawCheckbox(ctx, rect.left + offsetX, rect.bottom + offsetY, false, opt);
				}

				return canvas;
			}
			const canvas = createAnswerCanvas();
			expect(grid.canvas).toMatchImage(canvas, {tolerance: 100, delta: '20%', blurLevel: 1});
		});
	});
})();
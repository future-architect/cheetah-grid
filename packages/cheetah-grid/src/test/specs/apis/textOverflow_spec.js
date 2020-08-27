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
		{},
		{},
	];

	function createGrid(header, opt) {
		opt = opt || {};

		const grid = new cheetahGrid.ListGrid({
			parentElement: (function() {
				const parent = document.createElement('div');
				parent.id = 'parent';
				parent.style.width = '500px';
				parent.style.height = '300px';
				mainEl.appendChild(parent);
				return parent;
			})(),
			defaultRowHeight: opt.defaultRowHeight || 24,
			defaultColWidth: opt.defaultColWidth || 50,
			header: header,
			records: opt.records || records,
		});

		const theme = {};
		theme.frozenRowsBgColor = '#d3d3d3';
		grid.theme = cheetahGrid.themes.choices.BASIC.extends(theme);
		return grid;
	}


	describe('textOverflow', function() {


		function createAnswerCanvasBase(grid, opt) {
			opt = opt || {};
			const rows = (() => {
				const result = [];
				for (let i = 0; i < grid.rowCount; i++) {
					result.push(grid.getRowHeight(i));
				}
				return result;
			})();
			const cols = (() => {
				const result = [];
				for (let i = 0; i < grid.colCount; i++) {
					result.push(grid.getColWidth(i));
				}
				return result;
			})();

			const canvasHelper = window.createCanvasHelper(grid.canvas.width, grid.canvas.height);
			const ctx = canvasHelper.context;
			ctx.font = '16px sans-serif';

			const gridHelper = canvasHelper.createGridHelper(cols, rows);

			//塗りつぶし
			canvasHelper.fillRect('#f6f6f6');
			gridHelper.fillRect('white');
			gridHelper.fillRect('#d3d3d3', 0, 0, null, 0);
			gridHelper.fillRect('#f6f6f6', 0, 2, null, 1);

			//罫線
			gridHelper.lineAll(1);
			ctx.strokeStyle = '#5e9ed6';
			gridHelper.lineH(1, 0, 0, 0);
			gridHelper.lineH(2, 0, 0, 0, true);
			gridHelper.lineV(1, 0, 0, 0);
			gridHelper.lineV(2, 0, 0, 0, true);


			return {
				canvasHelper: canvasHelper,
				gridHelper: gridHelper,
			};

		}

		it('textOverflow="ellipsis"', function(done) {

			const grid = createGrid([
				{field() {
					return 'VALUE';
				},
				caption: 'TEST_',
				width: 50,
				style: {
					textOverflow: 'ellipsis'
				}},
			]);
			function createAnswerCanvas() {

				const base = createAnswerCanvasBase(grid);
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;

				const gridHelper = base.gridHelper;

				//TEXT
				ctx.fillStyle = '#000';
				const textOpt = {
					offset: 3,
					textBaseline: 'middle',
					textAlign: 'left',
				};
				gridHelper.text('TES\u2026', 0, 0, textOpt);
				gridHelper.text('VAL\u2026', 0, 1, {
					offset: 3,
					textBaseline: 'middle',
					textAlign: 'left',
				});
				gridHelper.text('VAL\u2026', 0, 2, {
					offset: 3,
					textBaseline: 'middle',
					textAlign: 'left',
				});


				return canvasHelper.canvas;
			}
			const canvas = createAnswerCanvas();
			setTimeout(function() {
				expect(grid.canvas).toMatchImage(canvas, {tolerance: 110, delta: '20%', blurLevel: 1});
				expect(grid.getCellOverflowText(0, 1)).toBe('VALUE');
				done();
			}, 200);

		});


		it('textOverflow="ellipsis" on multiline', function(done) {

			const grid = createGrid([
				{field() {
					return 'VALUE\nVALUE';
				},
				caption: 'TEST_',
				width: 50,
				columnType: 'multilinetext',
				style: {
					textOverflow: 'ellipsis'
				}},
			], {defaultRowHeight: 50});
			function createAnswerCanvas() {

				const base = createAnswerCanvasBase(grid);
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;

				const gridHelper = base.gridHelper;

				const em = ctx.measureText('あ').width;

				//TEXT
				ctx.fillStyle = '#000';
				const textOpt = {
					offset: 3,
					textBaseline: 'middle',
					textAlign: 'left',
				};
				gridHelper.text('TES\u2026', 0, 0, textOpt);
				gridHelper.text('VAL\u2026', 0, 1, {
					y: 61,
					offset: 4,
					textBaseline: 'middle',
					textAlign: 'left',
				});
				gridHelper.text('VAL\u2026', 0, 1, {
					y: 61 + em,
					offset: 4,
					textBaseline: 'middle',
					textAlign: 'left',
				});
				gridHelper.text('VAL\u2026', 0, 2, {
					y: 111,
					offset: 4,
					textBaseline: 'middle',
					textAlign: 'left',
				});
				gridHelper.text('VAL\u2026', 0, 2, {
					y: 111 + Number(em),
					offset: 4,
					textBaseline: 'middle',
					textAlign: 'left',
				});


				return canvasHelper.canvas;
			}
			const canvas = createAnswerCanvas();
			setTimeout(function() {
				expect(grid.canvas).toMatchImage(canvas, {tolerance: 200, delta: '30%', blurLevel: 1});
				expect(grid.getCellOverflowText(0, 1)).toBe('VALUE\nVALUE');
				done();
			}, 200);

		});


		it('lineClamp="auto" autoWrapText=true on multiline', function(done) {

			const grid = createGrid([
				{field() {
					return 'VALUE\nVALUE\nVALUE\nVALUE';
				},
				caption: 'TEST_',
				width: 50,
				columnType: 'multilinetext',
				style: {
					lineClamp: 'auto',
					autoWrapText: true,
				}},
			], {defaultRowHeight: 50, records: [{}]});
			function createAnswerCanvas() {

				const base = createAnswerCanvasBase(grid);
				const canvasHelper = base.canvasHelper;
				const ctx = canvasHelper.context;

				const gridHelper = base.gridHelper;

				const em = ctx.measureText('あ').width;

				const lineClamp = Math.floor((50 - 6) / em);
				console.log(`lineClamp=${lineClamp}`);

				//TEXT
				ctx.fillStyle = '#000';
				const textOpt = {
					offset: 3,
					textBaseline: 'middle',
					textAlign: 'left',
				};
				gridHelper.text('TES\u2026', 0, 0, textOpt);

				const valTop = 62;
				gridHelper.text('VALU', 0, 1, {
					y: valTop,
					offset: 3,
					textBaseline: 'middle',
					textAlign: 'left',
				});
				if (lineClamp === 2) {
					gridHelper.text('E\u2026', 0, 1, {
						y: valTop + em,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}

				if (lineClamp > 2) {
					gridHelper.text('E', 0, 1, {
						y: valTop + em,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp === 3) {
					gridHelper.text('VAL\u2026', 0, 1, {
						y: valTop + em * 2,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp > 3) {
					gridHelper.text('VALU', 0, 1, {
						y: valTop + em * 2,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp === 4) {
					gridHelper.text('E\u2026', 0, 1, {
						y: valTop + em * 3,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp > 4) {
					gridHelper.text('E', 0, 1, {
						y: valTop + em * 3,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp === 5) {
					gridHelper.text('VAL\u2026', 0, 1, {
						y: valTop + em * 4,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp > 5) {
					gridHelper.text('VALU', 0, 1, {
						y: valTop + em * 4,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp === 6) {
					gridHelper.text('E\u2026', 0, 1, {
						y: valTop + em * 5,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp > 6) {
					gridHelper.text('E', 0, 1, {
						y: valTop + em * 5,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				if (lineClamp === 7) {
					gridHelper.text('VAL\u2026', 0, 1, {
						y: valTop + em * 6,
						offset: 3,
						textBaseline: 'middle',
						textAlign: 'left',
					});
				}
				// other
				return canvasHelper.canvas;
			}
			const canvas = createAnswerCanvas();
			setTimeout(function() {
				expect(grid.canvas).toMatchImage(canvas, {tolerance: 210, delta: '25%', blurLevel: 1, log: true});
				expect(grid.getCellOverflowText(0, 1)).toBe('VALUE\nVALUE\nVALUE\nVALUE');
				done();
			}, 200);

		});

	});
})();
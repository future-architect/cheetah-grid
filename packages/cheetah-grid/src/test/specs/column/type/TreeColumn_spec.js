/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {TreeColumn} = cheetahGrid.columns.type;
	const {TreeStyle} = cheetahGrid.columns.style;

	function createRows() {
		return [
			{tree: {path: ['root'], caption: 'Root'}},
			{tree: {path: ['root', 'child'], caption: 'Child'}},
			{tree: {path: ['other'], caption: 'Other', nodeType: 'branch'}},
		];
	}

	function createGrid(rows) {
		return {
			dataSource: {
				length: rows.length,
				getField: function(index, field) {
					return rows[index] && rows[index][field];
				},
			},
			getField: function() {
				return 'tree';
			},
			getRecordIndexByRow: function(row) {
				return row;
			},
			getGridCanvasHelper: function() {
				return this.helper;
			},
		};
	}

	function createContext(row) {
		const rect = {
			left: 10,
			top: 20 + row * 30,
			width: 120,
			height: 30,
			right: 130,
			bottom: 50 + row * 30,
		};
		return {
			col: 0,
			row,
			getRect: function() {
				return rect;
			},
		};
	}

	function createCanvasContext(calls) {
		return {
			canvas: {
				width: 200,
				height: 100,
				style: {},
			},
			font: '10px sans-serif',
			textBaseline: 'middle',
			measureText: function() {
				return {width: 10};
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
			rect: function(left, top, width, height) {
				calls.push(['rect', left, top, width, height]);
			},
			clip: function() {
				calls.push(['clip']);
			},
			moveTo: function(x, y) {
				calls.push(['moveTo', x, y]);
			},
			lineTo: function(x, y) {
				calls.push(['lineTo', x, y]);
			},
			stroke: function() {
				calls.push(['stroke', this.strokeStyle, this.lineWidth]);
			},
		};
	}

	function createHelper(calls) {
		return {
			testFontLoad: function(font, text, context) {
				calls.push(['testFontLoad', font, text, context]);
			},
			toBoxPixelArray: function(padding) {
				return [padding, padding, padding, padding];
			},
			drawWithClip: function(context, callback) {
				callback(createCanvasContext(calls));
			},
			text: function(text, context, option) {
				calls.push(['text', text, context, option]);
			},
		};
	}

	function createDrawInfo(style, bases) {
		return {
			style,
			getRecord: function() {
				return {};
			},
			drawCellBase: function(option) {
				bases.push(option || {});
			},
			getIcon: function() {
				return null;
			},
			getMessage: function() {
				return null;
			},
			messageHandler: {
				drawCellMessage: function() {
					// noop
				},
			},
		};
	}

	function drawRootTreeColumn() {
		const rows = createRows();
		const grid = createGrid(rows);
		const calls = [];
		const bases = [];
		const helper = createHelper(calls);
		grid.helper = helper;
		const column = new TreeColumn({cache: true});
		const context = createContext(0);

		column.onDrawCell(rows[0].tree, createDrawInfo(new TreeStyle({
			color: 'ink',
			font: '10px sans-serif',
			lineColor: 'line',
			lineStyle: 'solid',
			lineWidth: 2,
			padding: 2,
			treeIcon: {
				path: 'M0 0 10 5 0 10z',
				width: 10,
				color: 'icon',
			},
		}), bases), context, grid);
		return {bases, calls, column, context, grid};
	}

	describe('TreeColumn', function() {
		it('normalizes copy values and clones cache options', function() {
			const column = new TreeColumn({cache: true});
			const clone = column.clone();

			expect(column.cache).toEqual(true);
			expect(clone).not.toBe(column);
			expect(clone.cache).toEqual(true);
			expect(column.StyleClass).toBe(TreeStyle);
			expect(column.getCopyCellValue(['root', 'child'])).toEqual('child');
			expect(column.getCopyCellValue({path: ['root'], caption: 'Root'})).toEqual('Root');
			expect(column.getCopyCellValue({
				path: function() {
					return ['root', 'leaf'];
				},
			})).toEqual('leaf');
			expect(column.getCopyCellValue(null)).toEqual('');
		});

		it('reports tree node type and child state from neighboring records', async function() {
			const {getTreeNodeInfoAt} = await import('../../../../js/columns/type/TreeColumn.ts');
			const rows = createRows();
			const grid = createGrid(rows);

			expect(getTreeNodeInfoAt({grid, col: 0, row: 0})).toEqual({
				nodeType: 'branch',
				hasChildren: true,
			});
			expect(getTreeNodeInfoAt({grid, col: 0, row: 1})).toEqual({
				nodeType: 'leaf',
				hasChildren: false,
			});
			expect(getTreeNodeInfoAt({grid, col: 0, row: 2})).toEqual({
				nodeType: 'branch',
				hasChildren: false,
			});
		});

		it('draws tree icons and text with configured style', function() {
			const {bases, calls, context} = drawRootTreeColumn();

			expect(bases).toEqual([{}]);
			expect(calls).toContainEqual(['testFontLoad', '10px sans-serif', 'Root', context]);
			expect(calls.filter(function(call) {
				return call[0] === 'text';
			})).toEqual([
				['text', '', context, {
					textAlign: 'center',
					textBaseline: 'middle',
					color: 'ink',
					font: '10px sans-serif',
					icons: [{
						path: 'M0 0 10 5 0 10z',
						width: 10,
						color: 'icon',
					}],
					padding: [2, 108, 2, 2],
				}],
				['text', 'Root', context, {
					textAlign: 'left',
					textBaseline: 'middle',
					color: 'ink',
					font: '10px sans-serif',
					padding: [2, 2, 2, 12],
					textOverflow: 'clip',
					icons: undefined,
				}],
			]);
		});

		it('tracks tree icon action areas and clears cached info', async function() {
			const {TREE_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const {column, grid} = drawRootTreeColumn();

			expect(grid[TREE_COLUMN_STATE_ID].cache.has('tree')).toEqual(true);
			expect(column.drawnIconActionArea({
				grid,
				col: 0,
				row: 0,
				pointInDrawingCanvas: {x: 17, y: 35},
			})).toEqual(true);
			expect(column.drawnIconActionArea({
				grid,
				col: 0,
				row: 0,
				pointInDrawingCanvas: {x: 40, y: 35},
			})).toEqual(false);
			column.clearCache(grid);
			expect(grid[TREE_COLUMN_STATE_ID].cache).toBeUndefined();
		});
	});
})();

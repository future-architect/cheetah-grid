/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {BranchGraphColumn} = cheetahGrid.columns.type;

	function createRows() {
		return [
			{graph: {command: 'branch', branch: 'main'}},
			{graph: {command: 'commit', branch: 'main'}},
			{graph: {command: 'tag', branch: 'main', tag: 'v1'}},
		];
	}

	function createGrid(rows, helper) {
		return {
			frozenRowCount: 0,
			dataSource: {
				length: rows.length,
				getField: function(index, field) {
					return rows[index] && rows[index][field];
				},
			},
			getField: function() {
				return 'graph';
			},
			getGridCanvasHelper: function() {
				return helper;
			},
			getCellRelativeRect: function(_col, row) {
				return {
					top: 20 + row * 40,
					height: 40,
				};
			},
		};
	}

	function createContext(row) {
		const rect = {
			left: 10,
			top: 20 + row * 40,
			width: 100,
			height: 40,
			right: 110,
			bottom: 60 + row * 40,
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
			textAlign: '',
			textBaseline: '',
			measureText: function(text) {
				return {width: String(text).length * 6};
			},
			beginPath: function() {
				calls.push(['beginPath']);
			},
			moveTo: function(x, y) {
				calls.push(['moveTo', x, y]);
			},
			lineTo: function(x, y) {
				calls.push(['lineTo', x, y]);
			},
			bezierCurveTo: function(...args) {
				calls.push(['bezierCurveTo', ...args]);
			},
			stroke: function() {
				calls.push(['stroke', this.strokeStyle, this.lineWidth, this.lineCap]);
			},
			arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
				calls.push(['arc', x, y, radius, startAngle, endAngle, anticlockwise]);
			},
			fill: function() {
				calls.push(['fill', this.fillStyle]);
			},
			closePath: function() {
				calls.push(['closePath']);
			},
			fillText: function(text, x, y) {
				calls.push(['fillText', text, x, y, this.fillStyle]);
			},
		};
	}

	function createHelper(calls) {
		return {
			drawWithClip: function(context, callback) {
				calls.push(['clip', context.row]);
				callback(createCanvasContext(calls));
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

	function createBranchStyle(BranchGraphStyle) {
		return new BranchGraphStyle({
			branchColors: function(name, index) {
				return `${name}:${index}`;
			},
			branchLineWidth: 3,
			circleSize: 10,
			margin: 2,
			mergeStyle: 'straight',
			bgColor: 'base',
		});
	}

	describe('BranchGraphColumn', function() {
		it('clones options and clears cached branch timelines', async function() {
			const {BRANCH_GRAPH_COLUMN_STATE_ID} = await import('../../../../js/internal/symbolManager.ts');
			const {BranchGraphStyle} = await import('../../../../js/columns/style/BranchGraphStyle.ts');
			const rows = createRows();
			const calls = [];
			const bases = [];
			const helper = createHelper(calls);
			const grid = createGrid(rows, helper);
			const column = new BranchGraphColumn({cache: true, start: 'top'});
			const clone = column.clone();

			expect(column.cache).toEqual(true);
			expect(column.start).toEqual('top');
			expect(column.StyleClass).toBe(BranchGraphStyle);
			expect(clone).not.toBe(column);
			expect(clone.cache).toEqual(true);
			expect(clone.start).toEqual('top');

			column.onDrawCell(rows[0].graph, createDrawInfo(new BranchGraphStyle({
				visibility: 'hidden',
			}), bases), createContext(0), grid);

			expect(grid[BRANCH_GRAPH_COLUMN_STATE_ID].has('graph')).toEqual(true);
			column.clearCache(grid);
			expect(grid[BRANCH_GRAPH_COLUMN_STATE_ID]).toBeUndefined();
		});

		it('draws commits, joins, and tags from branch commands', async function() {
			const {BranchGraphStyle} = await import('../../../../js/columns/style/BranchGraphStyle.ts');
			const rows = createRows();
			const calls = [];
			const bases = [];
			const helper = createHelper(calls);
			const grid = createGrid(rows, helper);
			const column = new BranchGraphColumn({start: 'top'});
			const style = createBranchStyle(BranchGraphStyle);
			const info = {
				drawCellBase: function(option) {
					bases.push(option || {});
				},
			};

			column.drawInternal(rows[1].graph, createContext(1), style, helper, grid, info);
			expect(bases).toEqual([{bgColor: 'base'}]);
			expect(calls).toContainEqual(['moveTo', 17, 40]);
			expect(calls).toContainEqual(['lineTo', 17, 80]);

			column.drawInternal(rows[2].graph, createContext(2), style, helper, grid, info);

			expect(bases).toEqual([
				{bgColor: 'base'},
				{bgColor: 'base'},
			]);
			expect(calls).toContainEqual(['stroke', 'main:0', 3, 'round']);
			expect(calls).toContainEqual(['arc', 17, 80, 5, 0, Math.PI * 2, true]);
			expect(calls).toContainEqual(['fill', 'main:0']);
			expect(calls).toContainEqual(['fillText', 'v1', 26, 120, 'main:0']);
		});
	});
})();

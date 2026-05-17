/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	async function createSimpleHeaderLayoutMap() {
		const {SimpleHeaderLayoutMap} = await import('../../../js/list-grid/layout-map/internal/simple-header-layout.ts');
		return new SimpleHeaderLayoutMap([
			{
				caption: 'Group',
				columns: [
					{caption: 'Name', field: 'name', width: 80},
					{caption: 'Age', field: 'age', sort: true},
				],
			},
			{caption: 'Flag', field: 'flag', headerType: 'check', columnType: 'check'},
		]);
	}

	async function createMultiLayoutMap() {
		const {MultiLayoutMap} = await import('../../../js/list-grid/layout-map/internal/multi-layout.ts');
		return new MultiLayoutMap({
			header: [
				[
					{caption: 'Group', colSpan: 2, headerField: 'group'},
					{caption: 'Solo', rowSpan: 2, headerField: 'solo'},
				],
				[
					{caption: 'A', headerField: 'a'},
					{caption: 'B', headerField: 'b'},
				],
			],
			body: [
				[
					{field: 'a', rowSpan: 2, width: 60},
					{field: 'b', colSpan: 2},
				],
				[
					{field: 'c'},
					{field: 'd'},
				],
			],
		});
	}

	describe('layout maps', function() {
		it('builds simple header layout map dimensions and data', async function() {
			const map = await createSimpleHeaderLayoutMap();

			expect(map.headerRowCount).toEqual(2);
			expect(map.bodyRowCount).toEqual(1);
			expect(map.colCount).toEqual(3);
			expect(map.columnWidths[0]).toMatchObject({field: 'name', width: 80});
			expect(map.getHeader(0, 0).caption).toEqual('Group');
			expect(map.getHeader(1, 0).caption).toEqual('Group');
			expect(map.getHeader(2, 0).caption).toEqual('Flag');
			expect(map.getBody(2, 2).field).toEqual('flag');
		});

		it('builds simple header layout map ranges and record rows', async function() {
			const map = await createSimpleHeaderLayoutMap();

			expect(map.getCellRange(0, 0)).toEqual({
				start: {col: 0, row: 0},
				end: {col: 1, row: 0},
			});
			expect(map.getCellRange(2, 0)).toEqual({
				start: {col: 2, row: 0},
				end: {col: 2, row: 1},
			});
			expect(map.getCellRange(1, 2)).toEqual({
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			});
			expect(map.getRecordIndexByRow(1)).toEqual(-1);
			expect(map.getRecordIndexByRow(2)).toEqual(0);
			expect(map.getRecordStartRowByRecordIndex(3)).toEqual(5);
			expect(map.getBodyLayoutRangeById(map.getBody(1, 2).id)).toEqual({
				start: {col: 1, row: 0},
				end: {col: 1, row: 0},
			});
		});

		it('uses simple header fallback data and rejects missing body layout ids', async function() {
			const map = await createSimpleHeaderLayoutMap();

			expect(function() {
				map.getBodyLayoutRangeById('__missing__');
			}).toThrow('can not found body layout');

			const emptyHeader = map.getHeader(99, 0);
			expect(map.getHeader(99, 0)).toBe(emptyHeader);
			expect(map.getBody(99, 0)).toBe(map.getBody(99, 0));
		});

		it('builds multi layout map dimensions and repeated layout data', async function() {
			const map = await createMultiLayoutMap();

			expect(map.headerRowCount).toEqual(2);
			expect(map.bodyRowCount).toEqual(2);
			expect(map.colCount).toEqual(3);
			expect(map.columnWidths[0]).toEqual({width: 60, maxWidth: undefined, minWidth: undefined});
			expect(map.getHeader(0, 0).caption).toEqual('Group');
			expect(map.getHeader(2, 1).caption).toEqual('Solo');
			expect(map.getBody(0, 2).field).toEqual('a');
			expect(map.getBody(0, 3).field).toEqual('a');
			expect(map.getBody(1, 2).field).toEqual('b');
			expect(map.getBody(2, 2).field).toEqual('b');
		});

		it('resolves multi layout map cell ranges for row and column spans', async function() {
			const map = await createMultiLayoutMap();

			expect(map.getCellRange(0, 0)).toEqual({
				start: {col: 0, row: 0},
				end: {col: 1, row: 0},
			});
			expect(map.getCellRange(2, 0)).toEqual({
				start: {col: 2, row: 0},
				end: {col: 2, row: 1},
			});
			expect(map.getCellRange(0, 2)).toEqual({
				start: {col: 0, row: 2},
				end: {col: 0, row: 3},
			});
			expect(map.getCellRange(1, 2)).toEqual({
				start: {col: 1, row: 2},
				end: {col: 2, row: 2},
			});
		});

		it('resolves multi layout map record and body layout ranges', async function() {
			const map = await createMultiLayoutMap();

			expect(map.getRecordIndexByRow(1)).toEqual(-1);
			expect(map.getRecordIndexByRow(2)).toEqual(0);
			expect(map.getRecordIndexByRow(4)).toEqual(1);
			expect(map.getRecordStartRowByRecordIndex(2)).toEqual(6);
			expect(map.getBodyLayoutRangeById(map.getBody(1, 2).id)).toEqual({
				start: {col: 1, row: 0},
				end: {col: 2, row: 0},
			});
			expect(function() {
				map.getBodyLayoutRangeById('__missing__');
			}).toThrow('can not found body layout');
		});

		it('creates reusable empty layout data', async function() {
			const utils = await import('../../../js/list-grid/layout-map/internal/utils.ts');
			const cache = new utils.EmptyDataCache();
			const header = cache.getHeader(1, 2);
			const body = cache.getBody(1, 2);

			expect(utils.newEmptyHeaderData().id).toBeLessThan(0);
			expect(utils.newEmptyColumnData().id).toBeLessThan(0);
			expect(cache.getHeader(1, 2)).toBe(header);
			expect(cache.getBody(1, 2)).toBe(body);
			expect(header.define).toEqual({});
			expect(body.define).toEqual({});
		});
	});
})();

/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const DataSource = cheetahGrid.data.DataSource;

	describe('DataSource', function() {
		it('wraps arrays with source, length, and index access', function() {
			const records = [{id: 1}, {id: 2}];
			const dataSource = DataSource.ofArray(records);

			expect(dataSource.source).toBe(records);
			expect(dataSource.dataSource).toBe(dataSource);
			expect(dataSource.length).toEqual(2);
			expect(dataSource.get(0)).toBe(records[0]);
			expect(dataSource.get(1)).toBe(records[1]);
		});

		it('gets fields by key, nested path, function, and accessor object', function() {
			const records = [{
				id: 1,
				nested: {value: 'nested'},
				value: 10,
			}];
			const dataSource = DataSource.ofArray(records);
			const accessor = {
				get: function(record) {
					return record.value * 2;
				},
				set: function(record, value) {
					record.value = value / 2;
					return true;
				},
			};

			expect(dataSource.getField(0, 'id')).toEqual(1);
			expect(dataSource.getField(0, 'nested.value')).toEqual('nested');
			expect(dataSource.getField(0, function(record) {
				return record.id + 1;
			})).toEqual(2);
			expect(dataSource.getField(0, accessor)).toEqual(20);
			expect(dataSource.hasField(0, 'id')).toEqual(true);
			expect(dataSource.hasField(0, 'missing')).toEqual(false);
			expect(dataSource.hasField(0, function() {
				return true;
			})).toEqual(true);
		});

		it('sets fields by key, nested path, function, and accessor object', function() {
			const records = [{id: 1}];
			const dataSource = DataSource.ofArray(records);
			const accessor = {
				get: function(record) {
					return record.value;
				},
				set: function(record, value) {
					record.value = value * 2;
					return true;
				},
			};

			expect(dataSource.setField(0, 'id', 2)).toEqual(true);
			expect(dataSource.setField(0, 'nested.value', 'nested')).toEqual(true);
			expect(dataSource.setField(0, function(record, value) {
				record.fn = value;
				return true;
			}, 'fn')).toEqual(true);
			expect(dataSource.setField(0, accessor, 5)).toEqual(true);
			expect(dataSource.setField(0, null, 1)).toEqual(false);

			expect(records[0]).toEqual({
				id: 2,
				nested: {value: 'nested'},
				fn: 'fn',
				value: 10,
			});
		});

		it('fires length events and allows update cancellation', function() {
			const dataSource = DataSource.ofArray([{id: 1}]);
			const calls = [];

			dataSource.listen(DataSource.EVENT_TYPE.UPDATE_LENGTH, function(length) {
				calls.push(['update', length]);
				return length !== 3;
			});
			dataSource.listen(DataSource.EVENT_TYPE.UPDATED_LENGTH, function(length) {
				calls.push(['updated', length]);
			});

			dataSource.length = 2;
			dataSource.length = 2;
			dataSource.length = 3;

			expect(dataSource.length).toEqual(2);
			expect(calls).toEqual([
				['update', 2],
				['updated', 2],
				['update', 3],
			]);
		});

		it('sorts by field and fires updated order events', async function() {
			const dataSource = DataSource.ofArray([
				{id: 1, value: 30},
				{id: 2, value: 10},
				{id: 3, value: 20},
			]);
			const calls = [];

			dataSource.listen(DataSource.EVENT_TYPE.UPDATED_ORDER, function() {
				calls.push('updated_order');
			});

			await dataSource.sort('value', 'asc');
			expect([dataSource.get(0).id, dataSource.get(1).id, dataSource.get(2).id]).toEqual([2, 3, 1]);

			await dataSource.sort('value', 'desc');
			expect([dataSource.get(0).id, dataSource.get(1).id, dataSource.get(2).id]).toEqual([1, 3, 2]);
			expect(calls).toEqual(['updated_order', 'updated_order']);
		});
	});
})();

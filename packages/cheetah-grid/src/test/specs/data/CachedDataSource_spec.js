/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const CachedDataSource = cheetahGrid.data.CachedDataSource;

	describe('CachedDataSource', function() {
		it('caches resolved falsy records', async function() {
			let calls = 0;
			const dataSource = new CachedDataSource({
				get: function() {
					calls++;
					return Promise.resolve(0);
				},
				length: 1,
			});

			expect(await dataSource.get(0)).toEqual(0);
			expect(dataSource.get(0)).toEqual(0);
			expect(calls).toEqual(1);
		});

		it('caches resolved falsy field values', async function() {
			let fieldCalls = 0;
			const dataSource = CachedDataSource.ofArray([{
				value: function() {
					fieldCalls++;
					return Promise.resolve(0);
				},
			}]);

			expect(await dataSource.getField(0, 'value')).toEqual(0);
			expect(dataSource.getField(0, 'value')).toEqual(0);
			expect(fieldCalls).toEqual(1);
		});

		it('clears record and field caches', async function() {
			let recordCalls = 0;
			let fieldCalls = 0;
			const records = [{
				value: function() {
					fieldCalls++;
					return Promise.resolve(fieldCalls);
				},
			}];
			const dataSource = new CachedDataSource({
				get: function(index) {
					recordCalls++;
					return Promise.resolve(records[index]);
				},
				length: records.length,
				source: records,
			});

			expect(await dataSource.get(0)).toBe(records[0]);
			expect(dataSource.get(0)).toBe(records[0]);
			expect(await dataSource.getField(0, 'value')).toEqual(1);
			expect(dataSource.getField(0, 'value')).toEqual(1);

			dataSource.clearCache();

			expect(await dataSource.get(0)).toBe(records[0]);
			expect(await dataSource.getField(0, 'value')).toEqual(2);
			expect(recordCalls).toEqual(2);
			expect(fieldCalls).toEqual(2);
		});

		it('clears a row field cache when setting a field', async function() {
			let fieldCalls = 0;
			const record = {
				value: function() {
					fieldCalls++;
					return Promise.resolve(fieldCalls);
				},
			};
			const dataSource = CachedDataSource.ofArray([record]);

			expect(await dataSource.getField(0, 'value')).toEqual(1);
			record.value = function() {
				fieldCalls++;
				return Promise.resolve(fieldCalls + 10);
			};
			expect(dataSource.setField(0, 'other', 'updated')).toEqual(true);

			expect(await dataSource.getField(0, 'value')).toEqual(12);
			expect(record.other).toEqual('updated');
		});
	});
})();

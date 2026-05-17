/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const NUMBER_OF_RECORDS = 10;
	const data = cheetahGrid.data;
	// const UPDATED_ORDER = data.DataSource.EVENT_TYPE.UPDATED_ORDER;
	function dataToArray(dc) {
		const array = [];
		for (let index = 0; index < dc.length; index++) {
			const data = dc.get(index);
			if (index < dc.length) {
				array.push(data);
			}
		}
		return array;
	}
	function newFilterDataSource() {
		const dataSource = data.DataSource.ofArray(new Array(NUMBER_OF_RECORDS).fill(1).map((v, index) => ({index})));
		const filterDataSource = new cheetahGrid.data.FilterDataSource(dataSource, (v) => (v.index % 2) === 0);
		return filterDataSource;
	}


	describe('FilterDataSource filter', function() {
		const filterDataSource = newFilterDataSource();
		it('Data should be filtered', function() {
			const array = dataToArray(filterDataSource);
			expect(array.length).toEqual(NUMBER_OF_RECORDS / 2);
			expect(array).
				toEqual(new Array(NUMBER_OF_RECORDS / 2).fill(1).map((v, index) => ({index: index * 2})));
		});
	});

	describe('FilterDataSource sort', function() {
		const filterDataSource = newFilterDataSource();
		it('Data should be filtered & sort', function(done) {
			filterDataSource.sort('index', 'desc').then(() => {
				const array = dataToArray(filterDataSource);
				expect(array.length).toEqual(NUMBER_OF_RECORDS / 2);
				expect(array).
					toEqual(new Array(NUMBER_OF_RECORDS / 2).fill(1).map((v, index) => ({index: index * 2})).
						reverse());
			}).then(done);
		});

		it('Even if I change the sort, the filter state must be preserved.', function(done) {
			filterDataSource.sort('index', 'asc').then(() => {
				const array = dataToArray(filterDataSource);
				expect(array.length).toEqual(NUMBER_OF_RECORDS / 2);
				expect(array).
					toEqual(new Array(NUMBER_OF_RECORDS / 2).fill(1).map((v, index) => ({index: index * 2})));
			}).then(done);
		});
		it('Even if I change the filter, the sort must be preserved.', function(done) {
			filterDataSource.sort('index', 'desc').then(() => {
				filterDataSource.filter = (v) => (v.index % 2) !== 0;
				const array = dataToArray(filterDataSource);
				expect(array.length).toEqual(NUMBER_OF_RECORDS / 2);
				expect(array).
					toEqual(new Array(NUMBER_OF_RECORDS / 2).fill(1).map((v, index) => ({index: index * 2 + 1})).
						reverse());
			}).then(done);
		});
	});

	describe('FilterDataSource data source behavior', function() {
		it('proxies source and dataSource and can disable filtering', function() {
			const records = [{id: 1}, {id: 2}];
			const dataSource = data.DataSource.ofArray(records);
			const filterDataSource = new cheetahGrid.data.FilterDataSource(dataSource, function(record) {
				return record.id === 2;
			});

			expect(filterDataSource.source).toBe(records);
			expect(filterDataSource.dataSource).toBe(dataSource);
			expect(filterDataSource.get(0)).toBe(records[1]);

			filterDataSource.filter = null;

			expect(filterDataSource.length).toEqual(2);
			expect(filterDataSource.get(0)).toBe(records[0]);
			expect(filterDataSource.get(1)).toBe(records[1]);
		});

		it('forwards length events from the wrapped data source until disposed', function() {
			const records = [{id: 1}];
			const dataSource = data.DataSource.ofArray(records);
			const filterDataSource = new cheetahGrid.data.FilterDataSource(dataSource, function() {
				return true;
			});
			const calls = [];

			filterDataSource.listen(data.DataSource.EVENT_TYPE.UPDATE_LENGTH, function(length) {
				calls.push(['update', length]);
			});
			filterDataSource.listen(data.DataSource.EVENT_TYPE.UPDATED_LENGTH, function(length) {
				calls.push(['updated', length]);
			});

			dataSource.length = 2;
			expect(calls).toEqual([
				['update', 2],
				['updated', 2],
			]);

			filterDataSource.dispose();
			dataSource.length = 3;

			expect(calls).toEqual([
				['update', 2],
				['updated', 2],
			]);
		});

		it('filters asynchronous records as they resolve', async function() {
			const records = [
				Promise.resolve({id: 1, keep: false}),
				Promise.resolve({id: 2, keep: true}),
			];
			const dataSource = new data.DataSource({
				length: records.length,
				get: function(index) {
					return records[index];
				},
				source: records,
			});
			const filterDataSource = new cheetahGrid.data.FilterDataSource(dataSource, function(record) {
				return record && record.keep;
			});

			expect(await filterDataSource.get(0)).toEqual({id: 2, keep: true});
			expect(filterDataSource.get(1)).toBeUndefined();
			expect(filterDataSource.length).toEqual(1);
		});
	});
})();

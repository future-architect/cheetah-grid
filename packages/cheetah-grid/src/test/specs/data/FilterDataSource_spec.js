/*global cheetahGrid*/
/*eslint-env es6*/
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
})();
/*global cheetahGrid*/
/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring: "off"*/
'use strict';
(function() {
	function isDef(data) {
		return data !== null && typeof data !== 'undefined';
	}
	const sort = cheetahGrid._getInternal().sort;

	describe('sort', function() {

		it('sort', function() {
			let str = 'abcdefg';
			sort.sort(
					function(i) {
						return str[i];
					},
					function(i, v) {
						str = str.substr(0, i) + v + str.substr(i + 1);
					},
					str.length,
					function(o1, o2) {
						const ret = o1 === o2 ? 0 : o1 < o2 ? 1 : -1;
						return ret;
					}
			);
			expect(str).toEqual('gfedcba');
		});

		it('sortArray', function() {
			const array = [2, 3, 5, 4, 1];
			sort.sortArray(
					array,
					function(v1, v2) {
						return v1 - v2;
					}
			);
			expect(array).toEqual([1, 2, 3, 4, 5]);
		});

		it('sortPromise_unuse_Promise', function(done) {
			const array = [];
			sort.sortPromise(
					function(i) {
						return isDef(array[i]) ? array[i] : i;
					},
					function(i, v) {
						array[i] = v;
					},
					5,
					function(v1, v2) {
						return v2 - v1;
					}
			).then(function() {
				expect(array).toEqual([4, 3, 2, 1, 0]);
				done();
			});
		});
		it('sortPromise', function(done) {
			const array = [];
			sort.sortPromise(
					function(i) {
						return isDef(array[i]) ? array[i] : i;
					},
					function(i, v) {
						array[i] = v;
					},
					5,
					function(v1, v2) {
						return v2 - v1;
					},
					function(r) {
						return new Promise(function(resolve) {
							resolve(r);
						});
					}
			).then(function() {
				expect(array).toEqual([4, 3, 2, 1, 0]);
				done();
			});
		});
		it('sortPromise2', function(done) {
			const array = [];
			sort.sortPromise(
					function(i) {
						return isDef(array[i]) ? array[i] : i;
					},
					function(i, v) {
						array[i] = v;
					},
					5,
					function(v1, v2) {
						return v2 - v1;
					},
					function(r) {
						return new Promise(function(resolve) {
							resolve(new Promise(function(resolve) {
								resolve(r);
							}));
						});
					}
			).then(function() {
				expect(array).toEqual([4, 3, 2, 1, 0]);
				done();
			});
		});
	});
})();
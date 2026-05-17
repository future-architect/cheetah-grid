/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {PercentCompleteBarColumn} = cheetahGrid.columns.type;
	const {PercentCompleteBarStyle} = cheetahGrid.columns.style;

	function createContext() {
		return {
			getRect: function() {
				return {
					left: 10,
					top: 20,
					width: 100,
					height: 40,
					right: 110,
					bottom: 60,
				};
			},
		};
	}

	function createHelper(drawCalls) {
		return {
			testFontLoad: function() {
				// noop
			},
			text: function(text, context, option) {
				drawCalls.push(['text', text, context, option]);
			},
			drawWithClip: function(context, callback) {
				const ctx = {
					fillStyle: '',
					beginPath: function() {
						drawCalls.push(['beginPath']);
					},
					rect: function(left, top, width, height) {
						drawCalls.push(['rect', left, top, width, height, this.fillStyle]);
					},
					fill: function() {
						drawCalls.push(['fill', this.fillStyle]);
					},
				};
				callback(ctx);
			},
		};
	}

	function createDrawInfo() {
		return {
			drawCellBase: function() {
				// noop
			},
			getIcon: function() {
				return null;
			},
		};
	}

	function createPercentStyle() {
		return new PercentCompleteBarStyle({
			barColor: function(rate) {
				return rate >= 100 ? 'full' : 'partial';
			},
			barBgColor: 'bg',
			barHeight: 4,
		});
	}

	describe('PercentCompleteBarColumn', function() {
		it('exposes constructor options and clones them', function() {
			const formatter = function(value) {
				return `${value}%`;
			};
			const column = new PercentCompleteBarColumn({
				min: 10,
				max: 30,
				formatter,
			});
			const clone = column.clone();

			expect(column.min).toEqual(10);
			expect(column.max).toEqual(30);
			expect(column.formatter).toBe(formatter);
			expect(clone).not.toBe(column);
			expect(clone.min).toEqual(10);
			expect(clone.max).toEqual(30);
			expect(clone.formatter).toBe(formatter);
		});

		it('draws text and a clamped percent bar', function() {
			const drawCalls = [];
			const column = new PercentCompleteBarColumn({
				min: 10,
				max: 30,
				formatter: function(value) {
					return `${value}%`;
				},
			});
			const style = createPercentStyle();
			const context = createContext();
			const helper = createHelper(drawCalls);

			column.drawInternal(20, context, style, helper, {}, createDrawInfo());

			expect(drawCalls[0][0]).toEqual('text');
			expect(drawCalls[0][1]).toEqual('20%');
			expect(drawCalls.slice(1)).toEqual([
				['beginPath'],
				['rect', 12, 53, 95, 4, 'bg'],
				['fill', 'bg'],
				['beginPath'],
				['rect', 12, 53, 47.5, 4, 'partial'],
				['fill', 'partial'],
			]);
		});

		it('skips non-numeric bar values and hidden styles', function() {
			const drawCalls = [];
			const column = new PercentCompleteBarColumn();
			const context = createContext();
			const helper = createHelper(drawCalls);

			column.drawInternal('not-number', context, new PercentCompleteBarStyle(), helper, {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});
			expect(drawCalls[0][0]).toEqual('text');
			expect(drawCalls[0][1]).toEqual('not-number');
			expect(drawCalls.filter(function(call) {
				return call[0] === 'rect';
			})).toEqual([]);

			column.drawInternal(50, context, new PercentCompleteBarStyle({visibility: 'hidden'}), helper, {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});

			expect(drawCalls.filter(function(call) {
				return call[0] === 'rect';
			})).toEqual([]);
		});
	});
})();

/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const styles = cheetahGrid.columns.style;

	describe('column styles', function() {
		it('normalizes base style visibility and indicators', function() {
			const style = new styles.BaseStyle({
				visibility: 'hidden',
				indicatorTopLeft: 'triangle',
			});
			const calls = [];

			style.listen(styles.EVENT_TYPE.CHANGE_STYLE, function() {
				calls.push('change');
			});

			expect(style.visibility).toEqual('hidden');
			expect(style.indicatorTopLeft).toEqual({style: 'triangle'});

			style.visibility = 'invalid';
			expect(style.visibility).toEqual('hidden');
			expect(calls).toEqual([]);

			style.visibility = 'visible';
			style.indicatorBottomRight = 'corner';

			expect(style.visibility).toEqual('visible');
			expect(style.indicatorBottomRight).toEqual({style: 'corner'});
			expect(calls).toEqual(['change', 'change']);
		});

		it('clones style instances independently', function() {
			const style = new styles.Style({
				bgColor: 'white',
				color: 'black',
				font: '12px sans-serif',
				textOverflow: 'ellipsis',
				padding: [1, 2],
			});
			const clone = style.clone();

			clone.color = 'red';
			clone.padding = 4;

			expect(style.color).toEqual('black');
			expect(style.padding).toEqual([1, 2]);
			expect(clone.color).toEqual('red');
			expect(clone.padding).toEqual(4);
			expect(clone.bgColor).toEqual('white');
			expect(clone.font).toEqual('12px sans-serif');
			expect(clone.textOverflow).toEqual('ellipsis');
		});

		it('applies specialized style defaults', function() {
			expect(new styles.NumberStyle().textAlign).toEqual('right');
			expect(new styles.ButtonStyle().textAlign).toEqual('center');
			expect(new styles.CheckStyle().textAlign).toEqual('center');
			expect(new styles.MultilineTextStyle().textBaseline).toEqual('top');
			expect(new styles.MultilineTextStyle().lineHeight).toEqual('1em');
			expect(new styles.MultilineTextStyle().autoWrapText).toEqual(false);
		});

		it('resolves style definitions from defaults, instances, callbacks, records, and objects', function() {
			const instance = new styles.Style({color: 'red'});
			const record = {
				styleKey: {color: 'blue'},
				dynamic: {color: 'green'},
			};

			expect(styles.of(null, record)).toBe(styles.Style.DEFAULT);
			expect(styles.of(instance, record)).toBe(instance);
			expect(styles.of(function(value) {
				return value.dynamic;
			}, record).color).toEqual('green');
			expect(styles.of('styleKey', record).color).toEqual('blue');
			expect(styles.of({color: 'black'}, record).color).toEqual('black');
			expect(styles.of({buttonBgColor: 'gray'}, record, styles.ButtonStyle).buttonBgColor).toEqual('gray');
		});

		it('keeps default style singletons stable', function() {
			expect(styles.BaseStyle.DEFAULT).toBe(styles.BaseStyle.DEFAULT);
			expect(styles.Style.DEFAULT).toBe(styles.Style.DEFAULT);
			expect(styles.NumberStyle.DEFAULT).toBe(styles.NumberStyle.DEFAULT);
			expect(styles.ButtonStyle.DEFAULT).toBe(styles.ButtonStyle.DEFAULT);
		});
	});
})();

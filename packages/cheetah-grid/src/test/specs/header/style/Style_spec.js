/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const styles = cheetahGrid.headers.style;

	describe('header styles', function() {
		it('fires change events and clones base styles independently', function() {
			const style = new styles.BaseStyle({bgColor: 'white'});
			const clone = style.clone();
			const calls = [];

			style.listen(styles.BaseStyle.EVENT_TYPE.CHANGE_STYLE, function() {
				calls.push('change');
			});

			clone.bgColor = 'gray';
			style.bgColor = 'black';

			expect(style.bgColor).toEqual('black');
			expect(clone.bgColor).toEqual('gray');
			expect(calls).toEqual(['change']);
		});

		it('applies text and multiline defaults', function() {
			const style = new styles.Style();
			const sortStyle = new styles.SortHeaderStyle();
			const multilineStyle = new styles.MultilineTextHeaderStyle();

			expect(style.textAlign).toEqual('left');
			expect(style.textBaseline).toEqual('middle');
			expect(style.textOverflow).toEqual('ellipsis');
			expect(style.lineHeight).toEqual('1em');
			expect(style.autoWrapText).toEqual(false);
			expect(style.multiline).toEqual(false);
			expect(sortStyle.multiline).toEqual(false);
			expect(sortStyle.sortArrowColor).toBeUndefined();
			expect(multilineStyle.textBaseline).toEqual('middle');
			expect(multilineStyle.lineHeight).toEqual('1em');
			expect(multilineStyle.autoWrapText).toEqual(false);
		});

		it('clones sort header style options', function() {
			const style = new styles.SortHeaderStyle({
				color: 'black',
				sortArrowColor: 'red',
				multiline: true,
				lineClamp: 2,
			});
			const clone = style.clone();

			clone.sortArrowColor = 'blue';
			clone.multiline = false;

			expect(style.color).toEqual('black');
			expect(style.sortArrowColor).toEqual('red');
			expect(style.multiline).toEqual(true);
			expect(style.lineClamp).toEqual(2);
			expect(clone.sortArrowColor).toEqual('blue');
			expect(clone.multiline).toEqual(false);
		});

		it('resolves header style definitions from defaults, instances, callbacks, and objects', function() {
			const instance = new styles.Style({color: 'red'});

			expect(styles.of(null, styles.Style)).toBe(styles.Style.DEFAULT);
			expect(styles.of(instance, styles.Style)).toBe(instance);
			expect(styles.of(function() {
				return {color: 'green'};
			}, styles.Style).color).toEqual('green');
			expect(styles.of({sortArrowColor: 'blue'}, styles.SortHeaderStyle).sortArrowColor).toEqual('blue');
		});

		it('keeps default style singletons stable', function() {
			expect(styles.BaseStyle.DEFAULT).toBe(styles.BaseStyle.DEFAULT);
			expect(styles.Style.DEFAULT).toBe(styles.Style.DEFAULT);
			expect(styles.SortHeaderStyle.DEFAULT).toBe(styles.SortHeaderStyle.DEFAULT);
			expect(styles.CheckHeaderStyle.DEFAULT).toBe(styles.CheckHeaderStyle.DEFAULT);
		});
	});
})();

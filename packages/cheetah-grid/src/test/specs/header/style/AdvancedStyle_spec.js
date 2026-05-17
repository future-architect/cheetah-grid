/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const styles = cheetahGrid.headers.style;

	describe('advanced header styles', function() {
		it('fires change events for text style setters', function() {
			const style = new styles.Style();
			const calls = [];

			style.listen(styles.BaseStyle.EVENT_TYPE.CHANGE_STYLE, function() {
				calls.push('change');
			});

			style.color = 'ink';
			style.font = '12px sans-serif';
			style.padding = 4;
			style.textOverflow = 'clip';

			expect(style.color).toEqual('ink');
			expect(style.font).toEqual('12px sans-serif');
			expect(style.padding).toEqual(4);
			expect(style.textOverflow).toEqual('clip');
			expect(calls).toEqual(['change', 'change', 'change', 'change']);
		});

		it('fires change events for multiline style setters', function() {
			const style = new styles.Style();
			const calls = [];

			style.listen(styles.BaseStyle.EVENT_TYPE.CHANGE_STYLE, function() {
				calls.push('change');
			});

			style.lineHeight = 18;
			style.autoWrapText = true;
			style.lineClamp = 2;
			style.multiline = true;

			expect(style.lineHeight).toEqual(18);
			expect(style.autoWrapText).toEqual(true);
			expect(style.lineClamp).toEqual(2);
			expect(style.multiline).toEqual(true);
			expect(calls).toEqual(['change', 'change', 'change', 'change']);
		});

		it('clones check header styles independently', function() {
			const check = new styles.CheckHeaderStyle({
				borderColor: 'border',
				checkBgColor: 'checked',
				uncheckBgColor: 'unchecked',
				padding: 2,
			});
			const checkClone = check.clone();

			checkClone.borderColor = 'cloneBorder';
			checkClone.checkBgColor = 'cloneChecked';
			checkClone.uncheckBgColor = 'cloneUnchecked';

			expect(check.borderColor).toEqual('border');
			expect(check.checkBgColor).toEqual('checked');
			expect(check.uncheckBgColor).toEqual('unchecked');
			expect(check.padding).toEqual(2);
			expect(checkClone.borderColor).toEqual('cloneBorder');
			expect(checkClone.checkBgColor).toEqual('cloneChecked');
			expect(checkClone.uncheckBgColor).toEqual('cloneUnchecked');
		});

		it('clones multiline header styles independently', function() {
			const multiline = new styles.MultilineTextHeaderStyle({
				color: 'ink',
				lineHeight: 20,
				autoWrapText: true,
				lineClamp: 3,
			});
			const multilineClone = multiline.clone();

			multilineClone.lineHeight = 24;
			multilineClone.autoWrapText = false;
			multilineClone.lineClamp = 1;

			expect(multiline.color).toEqual('ink');
			expect(multiline.lineHeight).toEqual(20);
			expect(multiline.autoWrapText).toEqual(true);
			expect(multiline.lineClamp).toEqual(3);
			expect(multilineClone.lineHeight).toEqual(24);
			expect(multilineClone.autoWrapText).toEqual(false);
			expect(multilineClone.lineClamp).toEqual(1);
		});

		it('resolves only Style instances directly and wraps other objects with the requested class', function() {
			const style = new styles.Style({color: 'ink'});
			const sort = new styles.SortHeaderStyle({sortArrowColor: 'arrow'});

			expect(styles.of(style, styles.SortHeaderStyle)).toBe(style);
			expect(styles.of(sort, styles.SortHeaderStyle)).toBeInstanceOf(styles.SortHeaderStyle);
			expect(styles.of(sort, styles.SortHeaderStyle)).not.toBe(sort);
			expect(styles.of(sort, styles.SortHeaderStyle).sortArrowColor).toEqual('arrow');
		});
	});
})();

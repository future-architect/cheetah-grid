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

		it('fires change events for base and standard text style setters', async function() {
			const {StdBaseStyle} = await import('../../../../js/columns/style/StdBaseStyle.ts');
			const base = new styles.BaseStyle({
				bgColor: 'white',
				indicatorTopRight: {style: 'triangle', color: 'red'},
			});
			const std = new StdBaseStyle({
				textAlign: 'left',
				textBaseline: 'top',
				padding: 1,
			});
			const text = new styles.Style({
				color: 'black',
				font: '12px sans-serif',
				textOverflow: 'clip',
			});
			const multiline = new styles.MultilineTextStyle({
				lineHeight: 18,
				autoWrapText: true,
				lineClamp: 3,
			});
			const calls = [];

			[base, std, text, multiline].forEach(function(style) {
				style.listen(styles.EVENT_TYPE.CHANGE_STYLE, function() {
					calls.push(style.constructor.name);
				});
			});

			base.bgColor = 'gray';
			base.indicatorTopLeft = 'triangle';
			base.indicatorTopRight = undefined;
			base.indicatorBottomLeft = {style: 'triangle', size: 4};
			std.textAlign = 'right';
			std.textBaseline = 'bottom';
			std.padding = [1, 2, 3, 4];
			text.color = 'blue';
			text.font = '13px serif';
			text.textOverflow = 'ellipsis';
			multiline.lineHeight = '2em';
			multiline.autoWrapText = false;
			multiline.lineClamp = undefined;

			expect(base.bgColor).toEqual('gray');
			expect(base.indicatorTopLeft).toEqual({style: 'triangle'});
			expect(base.indicatorTopRight).toEqual(undefined);
			expect(base.indicatorBottomLeft).toEqual({style: 'triangle', size: 4});
			expect(std.textAlign).toEqual('right');
			expect(std.textBaseline).toEqual('bottom');
			expect(std.padding).toEqual([1, 2, 3, 4]);
			expect(text.color).toEqual('blue');
			expect(text.font).toEqual('13px serif');
			expect(text.textOverflow).toEqual('ellipsis');
			expect(multiline.lineHeight).toEqual('2em');
			expect(multiline.autoWrapText).toEqual(false);
			expect(multiline.lineClamp).toEqual(undefined);
			expect(calls).toEqual([
				'BaseStyle',
				'BaseStyle',
				'BaseStyle',
				'BaseStyle',
				'StdBaseStyle',
				'StdBaseStyle',
				'StdBaseStyle',
				'Style',
				'Style',
				'Style',
				'MultilineTextStyle',
				'MultilineTextStyle',
				'MultilineTextStyle',
			]);
		});

		it('fires change events for specialized style setters', function() {
			const button = new styles.ButtonStyle({buttonBgColor: 'old'});
			const image = new styles.ImageStyle({imageSizing: undefined, margin: 4});
			const check = new styles.CheckStyle({
				uncheckBgColor: 'unchecked',
				checkBgColor: 'checked',
				borderColor: 'border',
			});
			const radio = new styles.RadioStyle({
				checkColor: 'check',
				uncheckBorderColor: 'uncheckBorder',
				checkBorderColor: 'checkBorder',
				uncheckBgColor: 'uncheckBg',
				checkBgColor: 'checkBg',
			});
			const tree = new styles.TreeStyle({
				lineStyle: 'solid',
				lineColor: 'line',
				lineWidth: 1,
				treeIcon: 'expand_more',
			});
			const calls = [];

			[button, image, check, radio, tree].forEach(function(style) {
				style.listen(styles.EVENT_TYPE.CHANGE_STYLE, function() {
					calls.push(style.constructor.name);
				});
			});

			button.buttonBgColor = 'new';
			image.imageSizing = 'keep-aspect-ratio';
			image.margin = 6;
			check.uncheckBgColor = 'newUnchecked';
			check.checkBgColor = 'newChecked';
			check.borderColor = 'newBorder';
			radio.checkColor = 'newCheck';
			radio.uncheckBorderColor = 'newUncheckBorder';
			radio.checkBorderColor = 'newCheckBorder';
			radio.uncheckBgColor = 'newUncheckBg';
			radio.checkBgColor = 'newCheckBg';
			tree.lineStyle = 'dashed';
			tree.lineColor = 'newLine';
			tree.lineWidth = 2;
			tree.treeIcon = {name: 'chevron_right'};

			expect(button.buttonBgColor).toEqual('new');
			expect(image.imageSizing).toEqual('keep-aspect-ratio');
			expect(image.margin).toEqual(6);
			expect(check.uncheckBgColor).toEqual('newUnchecked');
			expect(check.checkBgColor).toEqual('newChecked');
			expect(check.borderColor).toEqual('newBorder');
			expect(radio.checkColor).toEqual('newCheck');
			expect(radio.uncheckBorderColor).toEqual('newUncheckBorder');
			expect(radio.checkBorderColor).toEqual('newCheckBorder');
			expect(radio.uncheckBgColor).toEqual('newUncheckBg');
			expect(radio.checkBgColor).toEqual('newCheckBg');
			expect(tree.lineStyle).toEqual('dashed');
			expect(tree.lineColor).toEqual('newLine');
			expect(tree.lineWidth).toEqual(2);
			expect(tree.treeIcon).toEqual({name: 'chevron_right'});
			expect(calls).toEqual([
				'ButtonStyle',
				'ImageStyle',
				'ImageStyle',
				'CheckStyle',
				'CheckStyle',
				'CheckStyle',
				'RadioStyle',
				'RadioStyle',
				'RadioStyle',
				'RadioStyle',
				'RadioStyle',
				'TreeStyle',
				'TreeStyle',
				'TreeStyle',
				'TreeStyle',
			]);
		});
	});
})();

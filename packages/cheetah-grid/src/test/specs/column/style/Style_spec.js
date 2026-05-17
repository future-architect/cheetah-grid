/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-destructuring:"off"*/
'use strict';
(function() {
	const styles = cheetahGrid.columns.style;

	function listenChanges(style, calls) {
		style.listen(styles.EVENT_TYPE.CHANGE_STYLE, function() {
			calls.push(style.constructor.name);
		});
	}

	function expectSetterChange(style, property, value, expected, calls) {
		const before = calls.length;
		style[property] = value;
		expect(style[property]).toEqual(expected);
		expect(calls.slice(before)).toEqual([style.constructor.name]);
	}

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

		it('fires change events for base background setters', function() {
			const base = new styles.BaseStyle({
				bgColor: 'white',
			});
			const calls = [];
			listenChanges(base, calls);

			expectSetterChange(base, 'bgColor', 'gray', 'gray', calls);
			expect(calls).toEqual(['BaseStyle']);
		});

		it('fires change events for base indicator setters', function() {
			const base = new styles.BaseStyle({
				indicatorTopRight: {style: 'triangle', color: 'red'},
			});
			const calls = [];
			listenChanges(base, calls);
			expect(calls).toEqual([]);

			expectSetterChange(base, 'indicatorTopLeft', 'triangle', {style: 'triangle'}, calls);
			expectSetterChange(base, 'indicatorTopRight', undefined, undefined, calls);
			expectSetterChange(base, 'indicatorBottomLeft', {style: 'triangle', size: 4}, {
				style: 'triangle',
				size: 4,
			}, calls);
			expect(calls).toEqual(['BaseStyle', 'BaseStyle', 'BaseStyle']);
		});

		it('fires change events for standard text positioning setters', async function() {
			const {StdBaseStyle} = await import('../../../../js/columns/style/StdBaseStyle.ts');
			const std = new StdBaseStyle({
				textAlign: 'left',
				textBaseline: 'top',
				padding: 1,
			});
			const calls = [];
			listenChanges(std, calls);
			expect(calls).toEqual([]);

			expectSetterChange(std, 'textAlign', 'right', 'right', calls);
			expectSetterChange(std, 'textBaseline', 'bottom', 'bottom', calls);
			expectSetterChange(std, 'padding', [1, 2, 3, 4], [1, 2, 3, 4], calls);
			expect(calls).toEqual(['StdBaseStyle', 'StdBaseStyle', 'StdBaseStyle']);
		});

		it('fires change events for text style setters', function() {
			const text = new styles.Style({
				color: 'black',
				font: '12px sans-serif',
				textOverflow: 'clip',
			});
			const calls = [];
			listenChanges(text, calls);
			expect(calls).toEqual([]);

			expectSetterChange(text, 'color', 'blue', 'blue', calls);
			expectSetterChange(text, 'font', '13px serif', '13px serif', calls);
			expectSetterChange(text, 'textOverflow', 'ellipsis', 'ellipsis', calls);
			expect(calls).toEqual(['Style', 'Style', 'Style']);
		});

		it('fires change events for multiline text setters', function() {
			const multiline = new styles.MultilineTextStyle({
				lineHeight: 18,
				autoWrapText: true,
				lineClamp: 3,
			});
			const calls = [];
			listenChanges(multiline, calls);
			expect(calls).toEqual([]);

			expectSetterChange(multiline, 'lineHeight', '2em', '2em', calls);
			expectSetterChange(multiline, 'autoWrapText', false, false, calls);
			expectSetterChange(multiline, 'lineClamp', undefined, undefined, calls);
			expect(calls).toEqual(['MultilineTextStyle', 'MultilineTextStyle', 'MultilineTextStyle']);
		});

		it('fires change events for button style setters', function() {
			const button = new styles.ButtonStyle({buttonBgColor: 'old'});
			const calls = [];
			listenChanges(button, calls);

			expectSetterChange(button, 'buttonBgColor', 'new', 'new', calls);
			expect(calls).toEqual(['ButtonStyle']);
		});

		it('fires change events for image style setters', function() {
			const image = new styles.ImageStyle({imageSizing: undefined, margin: 4});
			const calls = [];
			listenChanges(image, calls);

			expectSetterChange(image, 'imageSizing', 'keep-aspect-ratio', 'keep-aspect-ratio', calls);
			expectSetterChange(image, 'margin', 6, 6, calls);
			expect(calls).toEqual(['ImageStyle', 'ImageStyle']);
		});

		it('fires change events for check style setters', function() {
			const check = new styles.CheckStyle({
				uncheckBgColor: 'unchecked',
				checkBgColor: 'checked',
				borderColor: 'border',
			});
			const calls = [];
			listenChanges(check, calls);
			expect(calls).toEqual([]);

			expectSetterChange(check, 'uncheckBgColor', 'newUnchecked', 'newUnchecked', calls);
			expectSetterChange(check, 'checkBgColor', 'newChecked', 'newChecked', calls);
			expectSetterChange(check, 'borderColor', 'newBorder', 'newBorder', calls);
			expect(calls).toEqual(['CheckStyle', 'CheckStyle', 'CheckStyle']);
		});

		it('fires change events for radio style setters', function() {
			const radio = new styles.RadioStyle({
				checkColor: 'check',
				uncheckBorderColor: 'uncheckBorder',
				checkBorderColor: 'checkBorder',
				uncheckBgColor: 'uncheckBg',
				checkBgColor: 'checkBg',
			});
			const calls = [];
			listenChanges(radio, calls);
			expect(calls).toEqual([]);

			expectSetterChange(radio, 'checkColor', 'newCheck', 'newCheck', calls);
			expectSetterChange(radio, 'uncheckBorderColor', 'newUncheckBorder', 'newUncheckBorder', calls);
			expectSetterChange(radio, 'checkBorderColor', 'newCheckBorder', 'newCheckBorder', calls);
			expect(calls).toEqual(['RadioStyle', 'RadioStyle', 'RadioStyle']);
			expectSetterChange(radio, 'uncheckBgColor', 'newUncheckBg', 'newUncheckBg', calls);
			expectSetterChange(radio, 'checkBgColor', 'newCheckBg', 'newCheckBg', calls);
			expect(calls).toEqual(['RadioStyle', 'RadioStyle', 'RadioStyle', 'RadioStyle', 'RadioStyle']);
		});

		it('fires change events for tree style setters', function() {
			const tree = new styles.TreeStyle({
				lineStyle: 'solid',
				lineColor: 'line',
				lineWidth: 1,
				treeIcon: 'expand_more',
			});
			const calls = [];
			listenChanges(tree, calls);
			expect(calls).toEqual([]);

			expectSetterChange(tree, 'lineStyle', 'dashed', 'dashed', calls);
			expectSetterChange(tree, 'lineColor', 'newLine', 'newLine', calls);
			expect(calls).toEqual(['TreeStyle', 'TreeStyle']);
			expectSetterChange(tree, 'lineWidth', 2, 2, calls);
			expectSetterChange(tree, 'treeIcon', {name: 'chevron_right'}, {name: 'chevron_right'}, calls);
			expect(calls).toEqual(['TreeStyle', 'TreeStyle', 'TreeStyle', 'TreeStyle']);
		});
	});
})();

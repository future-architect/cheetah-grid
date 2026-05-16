/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const styles = cheetahGrid.columns.style;

	describe('advanced column styles', function() {
		it('applies icon, image, menu, and percent bar defaults', function() {
			const icon = new styles.IconStyle();
			const image = new styles.ImageStyle();
			const menu = new styles.MenuStyle();
			const percent = new styles.PercentCompleteBarStyle();

			expect(icon.textAlign).toEqual('center');
			expect(image.textAlign).toEqual('center');
			expect(image.margin).toEqual(4);
			expect(image.imageSizing).toBeUndefined();
			expect(menu.appearance).toEqual('menulist-button');
			expect(percent.barBgColor).toEqual('#f0f3f5');
			expect(percent.barHeight).toEqual(3);
			expect(percent.barColor(10)).toEqual('#f86c6b');
			expect(percent.barColor(30)).toEqual('#ffc107');
			expect(percent.barColor(60)).toEqual('#4dbd74');
			expect(percent.barColor(90)).toEqual('#20a8d8');
		});

		it('applies radio, tree, and branch graph defaults', async function() {
			const {BranchGraphStyle} = await import('../../../../js/columns/style/BranchGraphStyle.ts');
			const radio = new styles.RadioStyle();
			const tree = new styles.TreeStyle();
			const branch = new BranchGraphStyle();

			expect(radio.textAlign).toEqual('center');
			expect(radio.checkColor).toBeUndefined();
			expect(tree.lineStyle).toBeUndefined();
			expect(tree.treeIcon).toBeUndefined();
			expect(branch.margin).toEqual(4);
			expect(branch.circleSize).toEqual(16);
			expect(branch.branchLineWidth).toEqual(4);
			expect(branch.mergeStyle).toEqual('bezier');
			expect(branch.branchColors('main', 0)).toEqual('#979797');
			expect(branch.branchColors('main', 1)).toEqual('#008fb5');
			expect(branch.branchColors('main', 2)).toEqual('#f1c109');
			expect(branch.branchColors('main', 3)).toEqual('#979797');
		});

		it('clones icon, number, image, menu, percent, radio, tree, and branch graph styles independently', async function() {
			const {BranchGraphStyle} = await import('../../../../js/columns/style/BranchGraphStyle.ts');
			const icon = new styles.IconStyle({
				color: 'ink',
			});
			const number = new styles.NumberStyle({
				color: 'num',
			});
			const image = new styles.ImageStyle({
				imageSizing: 'keep-aspect-ratio',
				margin: 8,
			});
			const menu = new styles.MenuStyle({appearance: 'none'});
			const percent = new styles.PercentCompleteBarStyle({
				barColor: 'red',
				barBgColor: 'gray',
				barHeight: 6,
			});
			const radio = new styles.RadioStyle({
				checkColor: 'black',
				checkBgColor: 'white',
			});
			const tree = new styles.TreeStyle({
				lineStyle: 'dashed',
				lineColor: 'blue',
				lineWidth: 2,
				treeIcon: 'expand_more',
			});
			const branch = new BranchGraphStyle({
				branchColors: 'orange',
				margin: 5,
				circleSize: 7,
				branchLineWidth: 3,
				mergeStyle: 'straight',
			});

			const iconClone = icon.clone();
			const numberClone = number.clone();
			const imageClone = image.clone();
			const menuClone = menu.clone();
			const percentClone = percent.clone();
			const radioClone = radio.clone();
			const treeClone = tree.clone();
			const branchClone = branch.clone();

			iconClone.color = 'cloneInk';
			numberClone.textAlign = 'left';
			imageClone.margin = 9;
			imageClone.imageSizing = undefined;
			menuClone.appearance = 'menulist-button';
			percentClone.barHeight = 9;
			radioClone.checkColor = 'red';
			treeClone.lineWidth = 4;
			branchClone.mergeStyle = 'bezier';

			expect(icon.textAlign).toEqual('center');
			expect(icon.color).toEqual('ink');
			expect(iconClone.color).toEqual('cloneInk');
			expect(number.textAlign).toEqual('right');
			expect(number.color).toEqual('num');
			expect(numberClone.textAlign).toEqual('left');
			expect(image.margin).toEqual(8);
			expect(image.imageSizing).toEqual('keep-aspect-ratio');
			expect(imageClone.margin).toEqual(9);
			expect(imageClone.imageSizing).toBeUndefined();
			expect(menu.appearance).toEqual('none');
			expect(menuClone.appearance).toEqual('menulist-button');
			expect(percent.barHeight).toEqual(6);
			expect(percentClone.barHeight).toEqual(9);
			expect(radio.checkColor).toEqual('black');
			expect(radioClone.checkColor).toEqual('red');
			expect(tree.lineWidth).toEqual(2);
			expect(treeClone.lineWidth).toEqual(4);
			expect(branch.mergeStyle).toEqual('straight');
			expect(branchClone.mergeStyle).toEqual('bezier');
		});

		it('fires change events when specialized properties change', function() {
			const style = new styles.PercentCompleteBarStyle();
			const calls = [];

			style.listen(styles.EVENT_TYPE.CHANGE_STYLE, function() {
				calls.push('change');
			});

			style.barColor = 'red';
			style.barBgColor = 'gray';
			style.barHeight = 4;

			expect(calls).toEqual(['change', 'change', 'change']);
		});

		it('keeps specialized default singletons stable and fires branch graph changes', async function() {
			const {BranchGraphStyle} = await import('../../../../js/columns/style/BranchGraphStyle.ts');
			const branchColors = function(name, index) {
				return `${name}:${index}`;
			};
			const branch = new BranchGraphStyle();
			const calls = [];

			branch.listen(styles.EVENT_TYPE.CHANGE_STYLE, function() {
				calls.push('change');
			});

			branch.branchColors = branchColors;
			branch.margin = 6;
			branch.circleSize = 8;
			branch.branchLineWidth = 2;
			branch.mergeStyle = 'straight';

			expect(styles.IconStyle.DEFAULT).toBe(styles.IconStyle.DEFAULT);
			expect(styles.ImageStyle.DEFAULT).toBe(styles.ImageStyle.DEFAULT);
			expect(styles.MenuStyle.DEFAULT).toBe(styles.MenuStyle.DEFAULT);
			expect(styles.RadioStyle.DEFAULT).toBe(styles.RadioStyle.DEFAULT);
			expect(styles.TreeStyle.DEFAULT).toBe(styles.TreeStyle.DEFAULT);
			expect(BranchGraphStyle.DEFAULT).toBe(BranchGraphStyle.DEFAULT);
			expect(branch.branchColors).toBe(branchColors);
			expect(branch.branchColors('main', 4)).toEqual('main:4');
			expect(branch.margin).toEqual(6);
			expect(branch.circleSize).toEqual(8);
			expect(branch.branchLineWidth).toEqual(2);
			expect(branch.mergeStyle).toEqual('straight');
			expect(calls).toEqual(['change', 'change', 'change', 'change', 'change']);
		});
	});
})();

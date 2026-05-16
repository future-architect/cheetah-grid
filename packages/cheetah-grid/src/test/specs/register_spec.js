/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {register, themes} = cheetahGrid;

	describe('register', function() {
		it('registers and retrieves icons', function() {
			const iconName = '__test_register_icon__';
			const first = {d: 'M0 0h1v1z', width: 1, height: 1};
			const second = {d: 'M0 0h2v2z', width: 2, height: 2};

			expect(register.icon(iconName)).toBeUndefined();
			expect(register.icon(iconName, first)).toBeUndefined();
			expect(register.icon(iconName)).toBe(first);
			expect(register.icon(iconName, second)).toBe(first);
			expect(register.icon(iconName)).toBe(second);
			expect(cheetahGrid.getIcons()[iconName]).toBe(second);
		});

		it('registers multiple icons', function() {
			const iconA = {d: 'M0 0h3v3z', width: 3, height: 3};
			const iconB = {d: 'M0 0h4v4z', width: 4, height: 4};

			register.icons({
				'__test_register_icons_a__': iconA,
				'__test_register_icons_b__': iconB,
			});

			expect(register.icon('__test_register_icons_a__')).toBe(iconA);
			expect(register.icon('__test_register_icons_b__')).toBe(iconB);
		});

		it('registers and resolves themes', function() {
			const themeName = '__test_register_theme__';
			const first = new themes.theme.Theme({
				font: '12px sans-serif',
				color: 'black',
				defaultBgColor: 'white',
				underlayBackgroundColor: 'transparent',
				borderColor: 'gray',
			});
			const second = first.extends({color: 'blue'});

			expect(register.theme(themeName)).toBeUndefined();
			expect(register.theme(themeName, first)).toBeUndefined();
			expect(register.theme(themeName)).toBe(first);
			expect(themes.of(themeName)).toBe(first);
			expect(register.theme(themeName, second)).toBe(first);
			expect(register.theme(themeName)).toBe(second);
			expect(themes.of(themeName)).toBe(second);
		});
	});
})();

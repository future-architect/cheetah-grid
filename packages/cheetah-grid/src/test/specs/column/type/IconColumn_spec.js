/*global cheetahGrid*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	const {IconColumn} = cheetahGrid.columns.type;
	const {IconStyle} = cheetahGrid.columns.style;

	function createContext() {
		return {
			col: 1,
			row: 2,
		};
	}

	function createHelper(calls) {
		return {
			testFontLoad: function() {
				// noop
			},
			text: function(text, context, option) {
				calls.push([text, context, option]);
			},
		};
	}

	describe('IconColumn', function() {
		it('exposes constructor options and clones them', function() {
			const column = new IconColumn({
				tagName: 'span',
				className: 'icon',
				content: 'A',
				name: 'arrow_upward',
				iconWidth: 12,
			});
			const clone = column.clone();

			expect(column.StyleClass).toBe(IconStyle);
			expect(column.tagName).toEqual('span');
			expect(column.className).toEqual('icon');
			expect(column.content).toEqual('A');
			expect(column.name).toEqual('arrow_upward');
			expect(column.iconWidth).toEqual(12);
			expect(clone).not.toBe(column);
			expect(clone.tagName).toEqual('span');
			expect(clone.className).toEqual('icon');
			expect(clone.content).toEqual('A');
			expect(clone.name).toEqual('arrow_upward');
			expect(clone.iconWidth).toEqual(12);
		});

		it('turns numeric values into repeated icons', function() {
			const calls = [];
			const column = new IconColumn({
				tagName: 'span',
				className: 'icon',
				content: 'A',
				name: 'arrow_upward',
				iconWidth: 12,
			});
			const context = createContext();
			const helper = createHelper(calls);

			column.drawInternal(2, context, new IconStyle({color: 'red'}), helper, {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return null;
				},
			});

			expect(calls.length).toEqual(1);
			expect(calls[0][0]).toEqual('');
			expect(calls[0][2].icons).toEqual([
				{
					content: 'A',
					font: '16px Times',
					color: 'red',
					isLiga: false,
					width: 12,
					src: undefined,
					svg: undefined,
					name: 'arrow_upward',
					path: undefined,
					tagName: 'span',
					offsetTop: undefined,
					offsetLeft: undefined,
				},
				{
					content: 'A',
					font: '16px Times',
					color: 'red',
					isLiga: false,
					width: 12,
					src: undefined,
					svg: undefined,
					name: 'arrow_upward',
					path: undefined,
					tagName: 'span',
					offsetTop: undefined,
					offsetLeft: undefined,
				},
			]);
		});

		it('clears icons for non-numeric values', function() {
			const calls = [];
			const column = new IconColumn({content: 'A'});

			column.drawInternal('nope', createContext(), new IconStyle(), createHelper(calls), {}, {
				drawCellBase: function() {
					// noop
				},
				getIcon: function() {
					return [{content: 'old'}];
				},
			});

			expect(calls[0][0]).toEqual('');
			expect(calls[0][2].icons).toEqual(undefined);
		});
	});
})();

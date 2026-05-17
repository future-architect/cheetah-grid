/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function rect(left, top, width, height) {
		return {
			left,
			top,
			width,
			height,
			right: left + width,
			bottom: top + height,
		};
	}

	function setClientRect(element, value) {
		Object.defineProperty(element, 'getBoundingClientRect', {
			configurable: true,
			value: function() {
				return value;
			},
		});
	}

	function createGrid() {
		const host = document.createElement('div');
		const changes = [];
		const invalidates = [];
		const moves = [];
		setClientRect(host, rect(100, 200, 240, 160));
		return {
			host,
			changes,
			invalidates,
			moves,
			font: '12px sans-serif',
			keyboardOptions: {
				moveCellOnEnter: true,
				moveCellOnTab: true,
			},
			getElement: function() {
				return host;
			},
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			getAttachCellsArea: function() {
				return {
					element: host,
					rect: rect(30, 40, 80, 24),
				};
			},
			invalidateCellRange: function(range) {
				invalidates.push(range);
			},
			focus: function() {
				this.focused = true;
			},
			doChangeValue: function(col, row, fn) {
				changes.push([col, row, fn('old')]);
			},
			onKeyDownMove: function(event) {
				moves.push(event.keyCode);
			},
		};
	}

	function createEditor(classList) {
		return {
			classList,
			options: function(record) {
				return [
					{value: '', label: `Empty ${record.id}`},
					{value: 'a', label: 'Alpha', classList: 'alpha-item'},
					{value: 'b', html: '<b>Bee</b>'},
				];
			},
		};
	}

	function prepareElement(element) {
		const menu = element._menu;
		const popoverCalls = [];
		menu.showPopover = function() {
			popoverCalls.push('show');
		};
		menu.hidePopover = function() {
			popoverCalls.push('hide');
		};
		setClientRect(menu, rect(110, 210, 90, 70));
		return {
			menu,
			popoverCalls,
		};
	}

	function keyEvent(keyCode, option) {
		const event = new KeyboardEvent('keydown', Object.assign({
			keyCode,
			which: keyCode,
			bubbles: true,
			cancelable: true,
		}, option || {}));
		Object.defineProperty(event, 'keyCode', {value: keyCode});
		Object.defineProperty(event, 'which', {value: keyCode});
		return event;
	}

	function withScrollIntoViewRecorder(fn) {
		const calls = [];
		const original = HTMLElement.prototype.scrollIntoView;
		HTMLElement.prototype.scrollIntoView = function(option) {
			calls.push([this, option]);
		};
		try {
			fn(calls);
		} finally {
			HTMLElement.prototype.scrollIntoView = original;
		}
	}

	function expectOpenedMenu(prepared) {
		const items = prepared.menu.querySelectorAll('li');
		expect(items.length).toEqual(3);
		expect(items[0].classList.contains('cheetah-grid__inline-menu__menu-item--empty')).toEqual(true);
		expect(items[0].textContent).toEqual('Empty 7');
		expect(items[1].classList.contains('alpha-item')).toEqual(true);
		expect(items[2].dataset.select).toEqual('select');
		expect(items[2].innerHTML).toEqual('<b>Bee</b>');
		expect(prepared.menu.classList.contains('menu-class')).toEqual(true);
		expect(prepared.menu.classList.contains('cheetah-grid__inline-menu--shown')).toEqual(true);
		expect(prepared.menu.style.font).toEqual('12px sans-serif');
		return items;
	}

	function expectMenuCellCss(menu) {
		expect(menu.style.getPropertyValue('--cheetah-grid-inline-menu-cell-top')).toEqual('240px');
		expect(menu.style.getPropertyValue('--cheetah-grid-inline-menu-cell-bottom')).toEqual('264px');
		expect(menu.style.getPropertyValue('--cheetah-grid-inline-menu-cell-left')).toEqual('130px');
		expect(menu.style.getPropertyValue('--cheetah-grid-inline-menu-cell-right')).toEqual('210px');
		expect(menu.style.getPropertyValue('--cheetah-grid-inline-menu-width')).toEqual('90px');
		expect(menu.style.getPropertyValue('--cheetah-grid-inline-menu-height')).toEqual('70px');
	}

	describe('InlineMenuElement', function() {
		it('opens menu options, focuses the selected value, and writes cell CSS variables', async function() {
			const {InlineMenuElement} = await import('../../../../js/columns/action/internal/InlineMenuElement.ts');
			const grid = createGrid();
			const element = new InlineMenuElement();
			const prepared = prepareElement(element);

			withScrollIntoViewRecorder(function(scrollCalls) {
				element.attach(grid, createEditor(['menu-class']), 1, 2, 'b', {id: 7});

				const items = expectOpenedMenu(prepared);
				expectMenuCellCss(prepared.menu);
				expect(scrollCalls[0][0]).toEqual(items[2]);
				expect(scrollCalls[0][1]).toEqual({
					behavior: 'instant',
					block: 'center',
				});
				expect(prepared.popoverCalls).toEqual(['show']);
			});

			element.dispose();
		});

		it('commits clicked values, removes prior editor classes, and detaches with grid focus', async function() {
			const {InlineMenuElement} = await import('../../../../js/columns/action/internal/InlineMenuElement.ts');
			const grid = createGrid();
			const element = new InlineMenuElement();
			const prepared = prepareElement(element);

			withScrollIntoViewRecorder(function() {
				element.attach(grid, createEditor(['first-class']), 1, 2, 'b', {id: 7});
				element.attach(grid, createEditor(['second-class']), 1, 2, 'a', {id: 8});
			});

			const item = prepared.menu.querySelectorAll('li')[1];
			item.querySelector('span').dispatchEvent(new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
			}));

			expect(prepared.menu.classList.contains('first-class')).toEqual(false);
			expect(prepared.menu.classList.contains('second-class')).toEqual(true);
			expect(grid.changes).toEqual([[1, 2, 'a']]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);
			expect(grid.focused).toEqual(true);
			expect(prepared.menu.classList.contains('cheetah-grid__inline-menu--hidden')).toEqual(true);
			expect(prepared.popoverCalls).toEqual(['show', 'show', 'hide']);

			element.dispose();
		});

		it('commits enter keys with grid movement', async function() {
			const {InlineMenuElement} = await import('../../../../js/columns/action/internal/InlineMenuElement.ts');
			const grid = createGrid();
			const element = new InlineMenuElement();
			const prepared = prepareElement(element);

			withScrollIntoViewRecorder(function() {
				element.attach(grid, createEditor(['menu-class']), 1, 2, 'a', {id: 7});
			});
			prepared.menu.querySelectorAll('li')[1].dispatchEvent(keyEvent(13));
			expect(grid.changes).toEqual([[1, 2, 'a']]);
			expect(grid.moves).toEqual([13]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);

			element.dispose();
		});

		it('commits tab keys with grid movement', async function() {
			const {InlineMenuElement} = await import('../../../../js/columns/action/internal/InlineMenuElement.ts');
			const grid = createGrid();
			const element = new InlineMenuElement();
			const prepared = prepareElement(element);

			withScrollIntoViewRecorder(function() {
				element.attach(grid, createEditor(['menu-class']), 1, 2, 'b', {id: 7});
			});
			prepared.menu.querySelectorAll('li')[2].dispatchEvent(keyEvent(9));

			expect(grid.changes).toEqual([[1, 2, 'b']]);
			expect(grid.moves).toEqual([9]);
			expect(grid.invalidates).toEqual([{
				start: {col: 1, row: 2},
				end: {col: 1, row: 2},
			}]);

			element.dispose();
		});
	});
})();

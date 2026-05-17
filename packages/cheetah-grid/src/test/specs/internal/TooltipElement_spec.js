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

	function createGrid(targetRect) {
		const host = document.createElement('div');
		const frozenRowRect = rect(40, 0, 60, 20);
		const frozenColRect = rect(0, 30, 20, 30);
		setClientRect(host, rect(100, 200, 140, 120));
		return {
			host,
			frozenRowCount: 1,
			frozenColCount: 1,
			getCellRange: function(col, row) {
				return {
					start: {col, row},
					end: {col, row},
				};
			},
			getAttachCellsArea: function(range) {
				let cellRect = targetRect.value;
				if (range.start.row === 0) {
					cellRect = frozenRowRect;
				} else if (range.start.col === 0) {
					cellRect = frozenColRect;
				}
				return {
					element: host,
					rect: cellRect,
				};
			},
		};
	}

	function prepareElement(element) {
		const root = element._rootElement;
		const popoverCalls = [];
		root.hidePopover = function() {
			popoverCalls.push('hide');
		};
		root.showPopover = function() {
			popoverCalls.push('show');
		};
		setClientRect(root, rect(190, 210, 70, 18));
		return {
			root,
			message: element._messageElement,
			popoverCalls,
		};
	}

	describe('TooltipElement', function() {
		it('is created by the concrete Tooltip class', async function() {
			const {Tooltip} = await import('../../../js/tooltip/Tooltip.ts');
			const {TooltipElement} = await import('../../../js/tooltip/internal/TooltipElement.ts');
			const tooltip = new Tooltip({});
			const element = tooltip.createTooltipElementInternal();
			const prepared = prepareElement(element);

			expect(element).toBeInstanceOf(TooltipElement);

			element.dispose();
			expect(prepared.popoverCalls).toEqual(['hide']);
		});

		it('attaches tooltip content and writes cell CSS variables', async function() {
			const {TooltipElement} = await import('../../../js/tooltip/internal/TooltipElement.ts');
			const targetRect = {value: rect(40, 30, 60, 30)};
			const grid = createGrid(targetRect);
			const element = new TooltipElement();
			const prepared = prepareElement(element);

			element.attach(grid, 2, 3, 'Tooltip text');

			expect(grid.host.contains(prepared.root)).toEqual(true);
			expect(prepared.message.textContent).toEqual('Tooltip text');
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--shown')).toEqual(true);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--hidden')).toEqual(false);
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-tooltip-element-cell-top')).toEqual('230px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-tooltip-element-cell-bottom')).toEqual('260px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-tooltip-element-cell-left')).toEqual('140px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-tooltip-element-cell-right')).toEqual('200px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-tooltip-element-width')).toEqual('70px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-tooltip-element-height')).toEqual('18px');
			expect(prepared.popoverCalls).toEqual(['hide', 'show']);
		});

		it('hides on detach, keeps the element attached, and removes it on dispose', async function() {
			const {TooltipElement} = await import('../../../js/tooltip/internal/TooltipElement.ts');
			const targetRect = {value: rect(40, 30, 60, 30)};
			const grid = createGrid(targetRect);
			const element = new TooltipElement();
			const prepared = prepareElement(element);

			element.attach(grid, 2, 3, 'Tooltip text');
			expect(grid.host.contains(prepared.root)).toEqual(true);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--shown')).toEqual(true);

			element.detach();

			expect(grid.host.contains(prepared.root)).toEqual(true);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--shown')).toEqual(false);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--hidden')).toEqual(true);
			expect(prepared.popoverCalls).toEqual(['hide', 'show', 'hide']);

			element.dispose();

			expect(grid.host.contains(prepared.root)).toEqual(false);
		});

		it('detaches when moved outside the attachable frozen area', async function() {
			const {TooltipElement} = await import('../../../js/tooltip/internal/TooltipElement.ts');
			const targetRect = {value: rect(40, 30, 60, 30)};
			const grid = createGrid(targetRect);
			const element = new TooltipElement();
			const prepared = prepareElement(element);

			element.attach(grid, 2, 3, 'Tooltip text');
			expect(grid.host.contains(prepared.root)).toEqual(true);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--shown')).toEqual(true);

			targetRect.value = rect(10, 30, 40, 30);
			element.move(grid, 2, 3);

			expect(grid.host.contains(prepared.root)).toEqual(true);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--shown')).toEqual(false);
			expect(prepared.root.classList.contains('cheetah-grid__tooltip-element--hidden')).toEqual(true);
			expect(prepared.popoverCalls).toEqual(['hide', 'show', 'hide']);

			element.dispose();
		});
	});
})();

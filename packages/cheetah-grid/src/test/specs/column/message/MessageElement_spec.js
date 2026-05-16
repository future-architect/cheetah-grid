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
			getElement: function() {
				return host;
			},
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

	describe('MessageElement', function() {
		it('attaches message content, styles it from the cell rect, and adjusts overflow', async function() {
			const {MessageElement} = await import('../../../../js/columns/message/internal/MessageElement.ts');
			const targetRect = {value: rect(40, 30, 60, 30)};
			const grid = createGrid(targetRect);
			const element = new MessageElement();
			const prepared = prepareElement(element);

			element.attach(grid, 2, 3, {type: 'info', message: 'Hello'});

			expect(grid.host.contains(prepared.root)).toEqual(true);
			expect(prepared.message.textContent).toEqual('Hello');
			expect(prepared.root.classList.contains('cheetah-grid__message-element--shown')).toEqual(true);
			expect(prepared.root.classList.contains('cheetah-grid__message-element--hidden')).toEqual(false);
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-cell-top')).toEqual('230px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-cell-bottom')).toEqual('260px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-cell-left')).toEqual('140px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-cell-right')).toEqual('200px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-width')).toEqual('70px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-height')).toEqual('18px');
			expect(prepared.root.style.left).toEqual('20px');
			expect(prepared.root.style.getPropertyValue('--cheetah-grid-message-element-left-diff')).toEqual('20px');
			expect(prepared.popoverCalls).toEqual(['hide']);
		});

		it('detaches when moved outside the attachable frozen area', async function() {
			const {MessageElement} = await import('../../../../js/columns/message/internal/MessageElement.ts');
			const targetRect = {value: rect(40, 30, 60, 30)};
			const grid = createGrid(targetRect);
			const element = new MessageElement();
			const prepared = prepareElement(element);

			element.attach(grid, 2, 3, {type: 'info', message: 'Hello'});
			targetRect.value = rect(10, 30, 40, 30);
			element.move(grid, 2, 3);

			expect(grid.host.contains(prepared.root)).toEqual(false);
			expect(prepared.root.classList.contains('cheetah-grid__message-element--shown')).toEqual(false);
			expect(prepared.root.classList.contains('cheetah-grid__message-element--hidden')).toEqual(true);
			expect(prepared.popoverCalls).toEqual(['hide', 'hide']);

			element.dispose();
		});

		it('adds severity-specific classes for error and warning elements', async function() {
			const {ErrorMessageElement} = await import('../../../../js/columns/message/internal/ErrorMessageElement.ts');
			const {WarningMessageElement} = await import('../../../../js/columns/message/internal/WarningMessageElement.ts');
			const error = new ErrorMessageElement();
			const warning = new WarningMessageElement();

			expect(error._rootElement.classList.contains('cheetah-grid__error-message-element')).toEqual(true);
			expect(error._messageElement.classList.contains('cheetah-grid__error-message-element__message')).toEqual(true);
			expect(warning._rootElement.classList.contains('cheetah-grid__warning-message-element')).toEqual(true);
			expect(warning._messageElement.classList.contains('cheetah-grid__warning-message-element__message')).toEqual(true);
		});
	});
})();

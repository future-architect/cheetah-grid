/*eslint prefer-arrow-callback:"off"*/
'use strict';
(function() {
	describe('dom', function() {
		it('creates elements with classes, text, and html', async function() {
			const dom = await import('../../../js/internal/dom.ts');

			const textElement = dom.createElement('button', {
				classList: ['primary', 'active'],
				text: 'Save',
			});
			const htmlElement = dom.createElement('div', {
				classList: 'content',
				html: '<span>Text</span>',
			});

			expect(textElement.tagName).toEqual('BUTTON');
			expect(textElement.classList.contains('primary')).toEqual(true);
			expect(textElement.classList.contains('active')).toEqual(true);
			expect(textElement.textContent).toEqual('Save');
			expect(htmlElement.classList.contains('content')).toEqual(true);
			expect(htmlElement.firstElementChild.tagName).toEqual('SPAN');
		});

		it('empties element children', async function() {
			const dom = await import('../../../js/internal/dom.ts');
			const element = document.createElement('div');
			element.innerHTML = '<span>A</span><span>B</span>';

			dom.empty(element);

			expect(element.childNodes.length).toEqual(0);
		});

		it('converts html strings, elements, and nested arrays to node lists', async function() {
			const dom = await import('../../../js/internal/dom.ts');
			const first = document.createElement('span');
			const second = document.createElement('strong');

			expect(dom.toNodeList('<span>A</span><strong>B</strong>').map(function(node) {
				return node.tagName;
			})).toEqual(['SPAN', 'STRONG']);
			expect(dom.toNodeList(first)).toEqual([first]);
			expect(dom.toNodeList([first, [second]])).toEqual([first, second]);
		});

		it('appends html strings and elements', async function() {
			const dom = await import('../../../js/internal/dom.ts');
			const parent = document.createElement('div');
			const element = document.createElement('button');

			dom.appendHtml(parent, '<span>A</span>');
			dom.appendHtml(parent, element);

			expect(Array.prototype.map.call(parent.children, function(child) {
				return child.tagName;
			})).toEqual(['SPAN', 'BUTTON']);
		});

		it('disables and restores focus recursively', async function() {
			const dom = await import('../../../js/internal/dom.ts');
			const parent = document.createElement('div');
			const first = document.createElement('button');
			const middle = document.createElement('span');
			const last = document.createElement('a');
			parent.tabIndex = 4;
			first.tabIndex = 1;
			middle.tabIndex = -1;
			last.tabIndex = 2;
			parent.appendChild(first);
			parent.appendChild(middle);
			parent.appendChild(last);

			dom.disableFocus(parent);

			expect(parent.tabIndex).toEqual(-1);
			expect(first.tabIndex).toEqual(-1);
			expect(last.tabIndex).toEqual(-1);
			expect(dom.isFocusable(first)).toEqual(false);

			dom.enableFocus(parent);

			expect(parent.tabIndex).toEqual(4);
			expect(first.tabIndex).toEqual(1);
			expect(last.tabIndex).toEqual(2);
			expect(dom.isFocusable(first)).toEqual(true);
			expect(dom.findPrevSiblingFocusable(last)).toBe(first);
			expect(dom.findNextSiblingFocusable(first)).toBe(last);
		});
	});
})();

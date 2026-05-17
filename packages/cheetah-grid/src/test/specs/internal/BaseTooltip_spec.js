/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createElementRecorder() {
		return {
			attaches: [],
			moves: [],
			detaches: 0,
			disposes: 0,
			attach: function(grid, col, row, content) {
				this.attaches.push([grid, col, row, content]);
			},
			move: function(grid, col, row) {
				this.moves.push([grid, col, row]);
			},
			_detach: function() {
				this.detaches++;
			},
			dispose: function() {
				this.disposes++;
			},
		};
	}

	describe('BaseTooltip', function() {
		it('lazily creates and reuses a tooltip element', async function() {
			const {BaseTooltip} = await import('../../../js/tooltip/BaseTooltip.ts');
			const grid = {id: 'grid'};
			const element = createElementRecorder();
			let createCount = 0;
			class TestTooltip extends BaseTooltip {
				createTooltipElementInternal() {
					createCount++;
					return element;
				}
			}
			const tooltip = new TestTooltip(grid);

			tooltip.attachTooltipElement(1, 2, 'Overflow');
			expect(createCount).toEqual(1);
			expect(element.attaches).toEqual([[grid, 1, 2, 'Overflow']]);

			tooltip.moveTooltipElement(1, 2);
			expect(element.moves).toEqual([[grid, 1, 2]]);

			tooltip.detachTooltipElement();

			expect(createCount).toEqual(1);
			expect(element.detaches).toEqual(1);
		});

		it('detaches and disposes the tooltip element', async function() {
			const {BaseTooltip} = await import('../../../js/tooltip/BaseTooltip.ts');
			const element = createElementRecorder();
			class TestTooltip extends BaseTooltip {
				createTooltipElementInternal() {
					return element;
				}
			}
			const tooltip = new TestTooltip({});

			tooltip.attachTooltipElement(1, 2, 'Overflow');
			tooltip.dispose();

			expect(element.detaches).toEqual(1);
			expect(element.disposes).toEqual(1);
		});
	});
})();

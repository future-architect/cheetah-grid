/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createElementRecorder() {
		return {
			attaches: [],
			moves: [],
			detaches: 0,
			disposes: 0,
			attach: function(grid, col, row, message) {
				this.attaches.push([grid, col, row, message]);
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

	describe('BaseMessage', function() {
		it('lazily creates and reuses a message element', async function() {
			const {BaseMessage} = await import('../../../js/columns/message/BaseMessage.ts');
			const grid = {id: 'grid'};
			const element = createElementRecorder();
			let createCount = 0;
			class TestMessage extends BaseMessage {
				createMessageElementInternal() {
					createCount++;
					return element;
				}
				drawCellMessageInternal(message) {
					this.lastDraw = message;
				}
			}
			const message = new TestMessage(grid);

			message.attachMessageElement(1, 2, {type: 'error', message: 'Error'});
			message.moveMessageElement(1, 2);
			message.detachMessageElement();
			message.drawCellMessage({type: 'error', message: 'Draw'});

			expect(createCount).toEqual(1);
			expect(element.attaches).toEqual([[grid, 1, 2, {type: 'error', message: 'Error'}]]);
			expect(element.moves).toEqual([[grid, 1, 2]]);
			expect(element.detaches).toEqual(1);
			expect(message.lastDraw).toEqual({type: 'error', message: 'Draw'});
		});

		it('detaches and disposes the message element', async function() {
			const {BaseMessage} = await import('../../../js/columns/message/BaseMessage.ts');
			const element = createElementRecorder();
			class TestMessage extends BaseMessage {
				createMessageElementInternal() {
					return element;
				}
				drawCellMessageInternal() {
					// noop
				}
			}
			const message = new TestMessage({});

			message.attachMessageElement(1, 2, {type: 'info', message: 'Info'});
			message.dispose();

			expect(element.detaches).toEqual(1);
			expect(element.disposes).toEqual(1);
		});
	});
})();

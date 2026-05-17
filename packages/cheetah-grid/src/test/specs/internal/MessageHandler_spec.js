/*eslint prefer-arrow-callback:"off", object-shorthand:"off"*/
'use strict';
(function() {
	function createGrid() {
		return {
			listeners: {},
			selection: {
				select: {col: 0, row: 0},
			},
			listen: function(type, listener) {
				this.listeners[type] = listener;
			},
			hasFocusGrid: function() {
				return true;
			},
		};
	}

	function createMessageInstance() {
		return {
			draws: [],
			attaches: [],
			moves: [],
			detaches: 0,
			disposes: 0,
			drawCellMessage: function(message) {
				this.draws.push(message);
			},
			attachMessageElement: function(col, row, message) {
				this.attaches.push([col, row, message]);
			},
			moveMessageElement: function(col, row) {
				this.moves.push([col, row]);
			},
			detachMessageElement: function() {
				this.detaches++;
			},
			dispose: function() {
				this.disposes++;
			},
		};
	}

	function createHandlerWithInstances(MessageHandler) {
		const grid = createGrid();
		const handler = new MessageHandler(grid, function() {
			return null;
		});
		const error = createMessageInstance();
		const info = createMessageInstance();
		handler._messageInstances.error = error;
		handler._messageInstances.info = info;
		return {error, handler, info};
	}

	describe('MessageHandler', function() {
		it('detects messages from strings and supported message objects', async function() {
			const {hasMessage} = await import('../../../js/columns/message/MessageHandler.ts');

			expect(hasMessage('Required')).toEqual(true);
			expect(hasMessage({type: 'info', message: 'Saved'})).toEqual(true);
			expect(hasMessage({type: 'unknown', message: 'Custom'})).toEqual(true);
			expect(hasMessage({type: 'warning', message: ''})).toEqual(false);
			expect(hasMessage(null)).toEqual(false);
			expect(hasMessage(Promise.resolve('Later'))).toEqual(false);
		});

		it('draws string messages with the error message instance', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const {error, handler} = createHandlerWithInstances(MessageHandler);

			handler.drawCellMessage('Required');
			expect(error.draws).toEqual([{
				type: 'error',
				message: 'Required',
				original: 'Required',
			}]);
		});

		it('draws info messages and ignores null messages', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const {error, handler, info} = createHandlerWithInstances(MessageHandler);

			handler.drawCellMessage({type: 'info', message: 'Saved'});
			expect(info.draws).toEqual([{
				type: 'info',
				message: 'Saved',
				original: {type: 'info', message: 'Saved'},
			}]);

			handler.drawCellMessage(null);

			expect(error.draws).toEqual([]);
			expect(info.draws).toEqual([{
				type: 'info',
				message: 'Saved',
				original: {type: 'info', message: 'Saved'},
			}]);
		});

		it('attaches, moves, detaches, and switches message instances', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const grid = createGrid();
			const handler = new MessageHandler(grid, function() {
				return null;
			});
			const error = createMessageInstance();
			const info = createMessageInstance();
			handler._messageInstances.error = error;
			handler._messageInstances.info = info;

			handler._attach(1, 2, 'Required');
			expect(error.attaches).toEqual([[
				1,
				2,
				{type: 'error', message: 'Required', original: 'Required'},
			]]);
			handler._move(1, 2);
			expect(error.moves).toEqual([[1, 2]]);
			handler._move(2, 2);
			expect(error.moves).toEqual([[1, 2]]);
			handler._attach(1, 2, {type: 'info', message: 'Saved'});
			expect(error.detaches).toEqual(1);
			expect(info.attaches).toEqual([[
				1,
				2,
				{type: 'info', message: 'Saved', original: {type: 'info', message: 'Saved'}},
			]]);
			handler._detach();
			expect(info.detaches).toEqual(1);
			handler._detach();
			expect(info.detaches).toEqual(1);
		});

		it('updates attached messages from grid events', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const {LG_EVENT_TYPE} = await import('../../../js/list-grid/LG_EVENT_TYPE.ts');
			const grid = createGrid();
			grid.selection.select = {col: 1, row: 1};
			const messages = {
				'1:1': 'Required',
			};
			const handler = new MessageHandler(grid, function(col, row) {
				return messages[`${col}:${row}`];
			});
			const error = createMessageInstance();
			handler._messageInstances.error = error;

			grid.listeners[LG_EVENT_TYPE.SELECTED_CELL]({
				selected: true,
				before: {col: 0, row: 0},
				col: 1,
				row: 1,
			});
			expect(error.attaches.length).toEqual(1);
			grid.listeners[LG_EVENT_TYPE.SCROLL]();
			expect(error.moves).toEqual([[1, 1]]);
			messages['1:1'] = null;
			grid.listeners[LG_EVENT_TYPE.CHANGED_VALUE]({col: 1, row: 1});
			expect(error.detaches).toEqual(1);
		});

		it('ignores unchanged and deselected selection events', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const {LG_EVENT_TYPE} = await import('../../../js/list-grid/LG_EVENT_TYPE.ts');
			const grid = createGrid();
			grid.selection.select = {col: 1, row: 1};
			const handler = new MessageHandler(grid, function() {
				return 'message';
			});
			const error = createMessageInstance();
			handler._messageInstances.error = error;

			grid.listeners[LG_EVENT_TYPE.SELECTED_CELL]({
				selected: true,
				before: {col: 1, row: 1},
				col: 1,
				row: 1,
			});
			expect(error.attaches).toEqual([]);
			grid.listeners[LG_EVENT_TYPE.SELECTED_CELL]({
				selected: false,
				before: {col: 0, row: 0},
				col: 1,
				row: 1,
			});
			expect(error.attaches).toEqual([]);
		});

		it('ignores async messages that resolve after selection moves away', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const {LG_EVENT_TYPE} = await import('../../../js/list-grid/LG_EVENT_TYPE.ts');
			const grid = createGrid();
			grid.selection.select = {col: 1, row: 1};
			let resolveMessage;
			const promise = new Promise(function(resolve) {
				resolveMessage = resolve;
			});
			const handler = new MessageHandler(grid, function() {
				return promise;
			});
			const error = createMessageInstance();
			handler._messageInstances.error = error;

			grid.listeners[LG_EVENT_TYPE.SELECTED_CELL]({
				selected: true,
				before: {col: 0, row: 0},
				col: 1,
				row: 1,
			});
			expect(error.attaches).toEqual([]);
			grid.selection.select = {col: 2, row: 2};
			resolveMessage('Stale');
			await promise;
			await new Promise(function(resolve) {
				setTimeout(resolve);
			});
			expect(error.attaches).toEqual([]);
		});

		it('attaches focused cell messages and detaches them on blur', async function() {
			const {MessageHandler} = await import('../../../js/columns/message/MessageHandler.ts');
			const {LG_EVENT_TYPE} = await import('../../../js/list-grid/LG_EVENT_TYPE.ts');
			const grid = createGrid();
			grid.selection.select = {col: 2, row: 2};
			const handler = new MessageHandler(grid, function() {
				return {type: 'unknown', message: 'Object message'};
			});
			const error = createMessageInstance();
			handler._messageInstances.error = error;

			grid.listeners[LG_EVENT_TYPE.FOCUS_GRID]({col: 2, row: 2});
			expect(error.attaches).toEqual([[
				2,
				2,
				{
					type: 'error',
					message: '[object Object]',
					original: {type: 'unknown', message: 'Object message'},
				},
			]]);
			grid.listeners[LG_EVENT_TYPE.BLUR_GRID]({});
			expect(error.detaches).toEqual(1);
		});
	});
})();

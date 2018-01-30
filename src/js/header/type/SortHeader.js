'use strict';
{
	const styleContents = require('../style');
	const {Style} = styleContents;
	const BaseHeader = require('./BaseHeader');
	const {isDef} = require('../../internal/utils');
	const {EVENT_TYPE: {
		CLICK_CELL,
		MOUSEENTER_CELL,
		MOUSELEAVE_CELL,
		MOUSEMOVE_CELL,
	}} = require('../../core/DrawGrid');

	class SortHeader extends BaseHeader {
		constructor(headerCell) {
			super(headerCell);
			this._sort = headerCell.sort;
			this._range = headerCell.range;
		}
		get StyleClass() {
			return Style;
		}
		drawInternal(value, context, style, helper, grid, {drawCellBase}) {
			const {
				textAlign,
				textBaseline = 'middle',
				color,
				bgColor,
				font,
			} = style;
			
			if (bgColor) {
				drawCellBase({
					bgColor,
				});
			}

			const state = grid.sortState;
			let order = undefined;
			if (this._range.isCellInRange(state.col, this._range.startRow)) {
				order = state.order;
			}

			const ctx = context.getContext();
			const arrowSize = ctx.measureText('あ').width * 1.2;

			helper.text(value, context, {
				textAlign,
				textBaseline,
				color,
				font,
				icons: [{
					name: isDef(order) ? (order === 'asc' ? 'arrow_downward' : 'arrow_upward') : null,
					width: arrowSize,
					color: '#555',
				}],
			});
		}
		_executeSort(newState, grid) {
			if (typeof this._sort === 'function') {
				this._sort(newState.order, newState.col, grid);
			} else {
				grid.dataSource.sort(grid.getField(newState.col), newState.order);
			}
		}
		bindGridEvent(grid) {
			return [
				grid.listen(CLICK_CELL, (e) => {
					if (!this._range.isCellInRange(e.col, e.row)) {
						return;
					}
					const state = grid.sortState;
					let newState;
					if (this._range.isCellInRange(state.col, e.row)) {
						newState = {
							col: this._range.startCol,
							order: state.order === 'asc' ? 'desc' : 'asc'
						};
					} else {
						newState = {
							col: this._range.startCol,
							order: 'asc'
						};
					}
					grid.sortState = newState;
					this._executeSort(newState, grid);
					grid.invalidateGridRect(0, 0, grid.colCount - 1, grid.rowCount - 1);
				}),
				// mouse move
				grid.listen(MOUSEENTER_CELL, (e) => {
					if (!this._range.isCellInRange(e.col, e.row)) {
						return;
					}
					grid.getElement().style.cursor = 'pointer';
				}),
				//横からMOUSEENTERした場合、'col-resize'の処理と競合するのでmoveを監視して処理する
				grid.listen(MOUSEMOVE_CELL, (e) => {
					if (!this._range.isCellInRange(e.col, e.row)) {
						return;
					}
					if (!grid.getElement().style.cursor) {
						grid.getElement().style.cursor = 'pointer';
					}
				}),
				grid.listen(MOUSELEAVE_CELL, (e) => {
					if (!this._range.isCellInRange(e.col, e.row)) {
						return;
					}
					grid.getElement().style.cursor = '';
				}),
			];
		}
	}
	module.exports = SortHeader;
}
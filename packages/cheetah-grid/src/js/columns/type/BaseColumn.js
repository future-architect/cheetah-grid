'use strict';

const styleContents = require('../style');
const {isPromise, isDef, obj: {setReadonly}} = require('../../internal/utils');
const animate = require('../../internal/animate');
const BaseStyle = require('../style/Style');
const {COLUMN_FADEIN_STATE_ID} = require('../../internal/symbolManager');


function isFadeinWhenCallbackInPromise(column, grid) {
	if (isDef(column._fadeinWhenCallbackInPromise)) {
		return column._fadeinWhenCallbackInPromise;
	}
	return !!grid.configure('fadeinWhenCallbackInPromise');
}

function getFadinState(grid) {
	if (!grid[COLUMN_FADEIN_STATE_ID]) {
		setReadonly(grid, COLUMN_FADEIN_STATE_ID, {});
	}
	return grid[COLUMN_FADEIN_STATE_ID];
}
function _generateFadinPointAction(grid, col, row, context, drawInternal, drawCellBase) {
	return (point) => {
		const state = getFadinState(grid);
		const stateKey = `${col}:${row}`;
		if (point === 1) {
			delete state[stateKey];
		} else {
			state[stateKey] = {
				opacity: point,
			};
		}
		drawCellBase();

		drawInternal();

		const cellState = state[stateKey];
		if (cellState) {
			//透過するため背景を透過で上書き
			const ctx = context.getContext();
			ctx.globalAlpha = 1 - cellState.opacity;
			try {
				drawCellBase();
			} finally {
				ctx.globalAlpha = 1;
			}
		}
	};
}
const fadinMgr = {
	animate(grid, col, row, context, drawInternal, drawCellBase) {
		// fadein animation
		const state = getFadinState(grid);

		const activeFadeins = [
			_generateFadinPointAction(grid, col, row, context, drawInternal, drawCellBase),
		];
		state.activeFadeins = activeFadeins;

		animate(500, (point) => {
			activeFadeins.forEach((f) => f(point));
			if (point === 1) {
				delete state.activeFadeins;
			}
		});
	},
	margeAnimate(grid, col, row, context, drawInternal, drawCellBase) {
		const state = getFadinState(grid);
		if (state.activeFadeins) {
			state.activeFadeins.push(
					_generateFadinPointAction(grid, col, row, context, drawInternal, drawCellBase)
			);
		} else {
			drawInternal();
		}
	},

};

class BaseColumn {
	constructor(option = {}) {
		this.onDrawCell = this.onDrawCell.bind(this);//スコープを固定させる

		//Promiseのcallbackでフェードイン表示する
		this._fadeinWhenCallbackInPromise = option.fadeinWhenCallbackInPromise;
	}
	get StyleClass() {
		return BaseStyle;
	}
	onDrawCell(cellValue, info, context, grid) {
		const {style, getRecord, drawCellBase} = info;
		const helper = grid.getGridCanvasHelper();
		drawCellBase();


		const record = getRecord();
		let promise;
		if (isPromise(record)) {
			promise = record.then(() => cellValue);
		} else if (isPromise(cellValue)) {
			promise = cellValue;
		}
		//文字描画
		if (promise) {
			const start = Date.now();
			return promise.then((val) => {
				const currentContext = context.toCurrentContext();
				const drawRect = currentContext.getDrawRect();
				if (!drawRect) {
					return;
				}
				const time = Date.now() - start;

				const drawInternal = () => {
					const currentContext = context.toCurrentContext();
					const drawRect = currentContext.getDrawRect();
					if (!drawRect) {
						return;
					}
					const record = getRecord();
					if (isPromise(record)) {
						return;
					}

					const actStyle = styleContents.of(style, record, this.StyleClass);
					this.drawInternal(
							this.convertInternal(val),
							currentContext,
							actStyle,
							helper,
							grid,
							info
					);
					this.drawMessageInternal(
							info.getMessage(),
							context,
							actStyle,
							helper,
							grid,
							info
					);
				};

				if (!isFadeinWhenCallbackInPromise(this, grid)) {
					drawInternal();//単純な描画
				} else {
					const {col, row} = context;
					if (time < 80) {
						//80ms以内のPromiseCallbackは前アニメーションに統合
						fadinMgr.margeAnimate(grid, col, row, context, drawInternal, drawCellBase);
					} else {
						//アニメーション
						fadinMgr.animate(grid, col, row, context, drawInternal, drawCellBase);
					}
				}
			});
		} else {
			const actStyle = styleContents.of(style, record, this.StyleClass);
			this.drawInternal(
					this.convertInternal(cellValue),
					context,
					actStyle,
					helper,
					grid,
					info
			);
			this.drawMessageInternal(
					info.getMessage(),
					context,
					actStyle,
					helper,
					grid,
					info
			);
			//フェードインの場合透過するため背景を透過で上書き
			const {col, row} = context;
			const stateKey = `${col}:${row}`;
			const cellState = grid[COLUMN_FADEIN_STATE_ID] && grid[COLUMN_FADEIN_STATE_ID][stateKey];
			if (cellState) {
				const ctx = context.getContext();
				ctx.globalAlpha = 1 - cellState.opacity;
				try {
					drawCellBase();
				} finally {
					ctx.globalAlpha = 1;
				}
			}
			return null;
		}
	}
	clone() {
		return new BaseColumn(this);
	}
	convertInternal(value) {
		return isDef(value) ? value : '';
	}
	drawInternal(value, context, style, helper, grid, info) {

	}
	drawMessageInternal(message, context, style, helper, grid, info) {
		info.messageHandler.drawCellMessage(message, context, style, helper, grid, info);
	}
	bindGridEvent(grid, col, util) {
		return [];
	}
}
module.exports = BaseColumn;

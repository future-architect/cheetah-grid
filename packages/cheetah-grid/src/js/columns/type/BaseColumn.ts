import * as styleContents from "../style";
import {
  BaseColumnOption,
  CellContext,
  EventListenerId,
  GridCanvasHelperAPI,
  LayoutObjectId,
  ListGridAPI,
  MaybePromise,
  Message
} from "../../ts-types";
import {
  ColumnFadeinState,
  DrawCellInfo,
  GridInternal
} from "../../ts-types-internal";
import { isDef, isPromise, obj } from "../../internal/utils";
import { BaseStyle } from "../style/BaseStyle";
import { animate } from "../../internal/animate";
import { getColumnFadeinStateId } from "../../internal/symbolManager";

const { setReadonly } = obj;
const COLUMN_FADEIN_STATE_ID = getColumnFadeinStateId();

function isFadeinWhenCallbackInPromise<T>(
  column: BaseColumn<T, unknown>,
  grid: ListGridAPI<T>
): boolean {
  if (isDef(column.fadeinWhenCallbackInPromise)) {
    return column.fadeinWhenCallbackInPromise;
  }
  return !!grid.configure("fadeinWhenCallbackInPromise");
}

function getFadinState<T>(grid: GridInternal<T>): ColumnFadeinState {
  let state = grid[COLUMN_FADEIN_STATE_ID];
  if (!state) {
    state = { cells: {} };
    setReadonly(grid, COLUMN_FADEIN_STATE_ID, state);
  }
  return state;
}
function _generateFadinPointAction<T>(
  grid: ListGridAPI<T>,
  col: number,
  row: number,
  context: CellContext,
  drawInternal: () => void,
  drawCellBase: () => void
): (point: number) => void {
  return (point: number): void => {
    const state = getFadinState(grid);
    const stateKey = `${row}:${col}`;
    if (point === 1) {
      delete state.cells[stateKey];
    } else {
      state.cells[stateKey] = {
        opacity: point
      };
    }
    drawCellBase();

    drawInternal();

    const cellState = state.cells[stateKey];
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
  animate<T>(
    grid: ListGridAPI<T>,
    col: number,
    row: number,
    context: CellContext,
    drawInternal: () => void,
    drawCellBase: () => void
  ): void {
    // fadein animation
    const state = getFadinState(grid);

    const activeFadeins = [
      _generateFadinPointAction(
        grid,
        col,
        row,
        context,
        drawInternal,
        drawCellBase
      )
    ];
    state.activeFadeins = activeFadeins;

    animate(500, (point: number) => {
      activeFadeins.forEach(f => f(point));
      if (point === 1) {
        delete state.activeFadeins;
      }
    });
  },
  margeAnimate<T>(
    grid: ListGridAPI<T>,
    col: number,
    row: number,
    context: CellContext,
    drawInternal: () => void,
    drawCellBase: () => void
  ): void {
    const state = getFadinState(grid);
    if (state.activeFadeins) {
      state.activeFadeins.push(
        _generateFadinPointAction(
          grid,
          col,
          row,
          context,
          drawInternal,
          drawCellBase
        )
      );
    } else {
      drawInternal();
    }
  }
};

export abstract class BaseColumn<T, V> {
  private _fadeinWhenCallbackInPromise: boolean;
  constructor(option: BaseColumnOption = {}) {
    this.onDrawCell = this.onDrawCell.bind(this); //スコープを固定させる

    //Promiseのcallbackでフェードイン表示する
    this._fadeinWhenCallbackInPromise =
      option.fadeinWhenCallbackInPromise || false;
  }
  get fadeinWhenCallbackInPromise(): boolean | undefined {
    return this._fadeinWhenCallbackInPromise;
  }
  get StyleClass(): typeof BaseStyle {
    return BaseStyle;
  }
  onDrawCell(
    cellValue: MaybePromise<unknown>,
    info: DrawCellInfo<T>,
    context: CellContext,
    grid: ListGridAPI<T>
  ): void | Promise<void> {
    const { style, getRecord, drawCellBase } = info;
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
      return promise.then(val => {
        const currentContext = context.toCurrentContext();
        const drawRect = currentContext.getDrawRect();
        if (!drawRect) {
          return;
        }
        const time = Date.now() - start;

        const drawInternal = (): void => {
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
            currentContext,
            actStyle,
            helper,
            grid,
            info
          );
        };

        if (!isFadeinWhenCallbackInPromise(this, grid)) {
          drawInternal(); //単純な描画
        } else {
          const { col, row } = context;
          if (time < 80) {
            //80ms以内のPromiseCallbackは前アニメーションに統合
            fadinMgr.margeAnimate(
              grid,
              col,
              row,
              context,
              drawInternal,
              drawCellBase
            );
          } else {
            //アニメーション
            fadinMgr.animate(
              grid,
              col,
              row,
              context,
              drawInternal,
              drawCellBase
            );
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
      const { col, row } = context;
      const stateKey = `${col}:${row}`;
      const cellState = (grid as GridInternal<T>)[COLUMN_FADEIN_STATE_ID]
        ?.cells[stateKey];
      if (cellState) {
        const ctx = context.getContext();
        ctx.globalAlpha = 1 - cellState.opacity;
        try {
          drawCellBase();
        } finally {
          ctx.globalAlpha = 1;
        }
      }
      return undefined;
    }
  }
  abstract clone(): BaseColumn<T, V>;
  convertInternal(value: unknown): V {
    return (isDef(value) ? value : "") as V;
  }
  abstract drawInternal(
    value: V,
    context: CellContext,
    style: BaseStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void;
  drawMessageInternal(
    message: Message,
    context: CellContext,
    style: BaseStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void {
    info.messageHandler.drawCellMessage(
      message,
      context,
      style,
      helper,
      grid,
      info
    );
  }
  bindGridEvent(
    _grid: ListGridAPI<T>,
    _cellId: LayoutObjectId
  ): EventListenerId[] {
    return [];
  }
}

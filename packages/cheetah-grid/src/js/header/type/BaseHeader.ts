import * as styleContents from "../style";
import type {
  CellAddress,
  CellContext,
  EventListenerId,
  HeaderStyleOption,
  LayoutObjectId,
  ListGridAPI,
} from "../../ts-types";
import { BaseStyle } from "../style/BaseStyle";
import type { DrawCellInfo } from "../../ts-types-internal";
import type { GridCanvasHelper } from "../../GridCanvasHelper";

export abstract class BaseHeader<T> {
  constructor(_options = {}) {
    this.onDrawCell = this.onDrawCell.bind(this); //スコープを固定させる
  }
  get StyleClass(): typeof BaseStyle {
    return BaseStyle;
  }
  onDrawCell(
    cellValue: unknown,
    info: DrawCellInfo<T>,
    context: CellContext,
    grid: ListGridAPI<T>
  ): void {
    const { style, drawCellBase } = info;
    const helper = grid.getGridCanvasHelper() as GridCanvasHelper<T>;
    drawCellBase();
    //文字描画
    this.drawInternal(
      this.convertInternal(cellValue),
      context,
      styleContents.of(style as HeaderStyleOption, this.StyleClass),
      helper,
      grid,
      info
    );
  }
  convertInternal(value: unknown): unknown {
    if (typeof value === "function") {
      value = value();
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return value != null ? `${value}` : "";
  }
  abstract drawInternal(
    value: unknown,
    context: CellContext,
    style: BaseStyle,
    helper: GridCanvasHelper<T>,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void;
  bindGridEvent(
    _grid: ListGridAPI<T>,
    _cellId: LayoutObjectId
  ): EventListenerId[] {
    return [];
  }
  getCopyCellValue(
    value: unknown,
    _grid: ListGridAPI<T>,
    _cell: CellAddress
  ): unknown {
    if (typeof value === "function") {
      value = value();
    }
    return value != null ? value : "";
  }
}

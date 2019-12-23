import * as styleContents from "../style";
import {
  CellContext,
  EventListenerId,
  GridCanvasHelperAPI,
  HeaderStyleOption,
  LayoutObjectId,
  ListGridAPI
} from "../../ts-types";
import { BaseStyle } from "../style/BaseStyle";
import { DrawCellInfo } from "../../ts-types-internal";
import { isDef } from "../../internal/utils";

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
    const helper = grid.getGridCanvasHelper();
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
  convertInternal(value: unknown): string {
    return isDef(value) ? `${value}` : "";
  }
  abstract drawInternal(
    value: string,
    context: CellContext,
    style: BaseStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    info: DrawCellInfo<T>
  ): void;
  bindGridEvent(
    _grid: ListGridAPI<T>,
    _cellId: LayoutObjectId
  ): EventListenerId[] {
    return [];
  }
}

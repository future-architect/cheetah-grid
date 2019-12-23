import * as utils from "./columnUtils";
import {
  ButtonColumnOption,
  CellContext,
  GridCanvasHelperAPI
} from "../../ts-types";
import { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { ButtonStyle } from "../style/ButtonStyle";
import { Column } from "./Column";
import { cellInRange } from "../../internal/utils";
import { getButtonColumnStateId } from "../../internal/symbolManager";

const BUTTON_COLUMN_STATE_ID = getButtonColumnStateId();

export class ButtonColumn<T> extends Column<T> {
  private _caption?: string;
  constructor(option: ButtonColumnOption = {}) {
    super(option);
    this._caption = option.caption;
  }
  get StyleClass(): typeof ButtonStyle {
    return ButtonStyle;
  }
  get caption(): string | undefined {
    return this._caption;
  }
  withCaption(caption: string): ButtonColumn<T> {
    const c = this.clone();
    c._caption = caption;
    return c;
  }
  clone(): ButtonColumn<T> {
    return new ButtonColumn(this);
  }
  convertInternal(value: unknown): string {
    return this._caption || super.convertInternal(value);
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: ButtonStyle,
    helper: GridCanvasHelperAPI,
    grid: GridInternal<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      bgColor,
      color,
      buttonBgColor,
      font,
      padding,
      textOverflow
    } = style;
    if (bgColor) {
      drawCellBase({
        bgColor
      });
    }
    helper.testFontLoad(font, value, context);
    const { col, row } = context;
    const range = grid.getCellRange(col, row);
    let active = false;
    const state = grid[BUTTON_COLUMN_STATE_ID];

    if (state) {
      if (
        state.mouseActiveCell &&
        cellInRange(range, state.mouseActiveCell.col, state.mouseActiveCell.row)
      ) {
        active = true;
      } else {
        const { select } = context.getSelection();
        if (cellInRange(range, select.col, select.row)) {
          active = true;
        }
      }
    }

    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      helper.button(value, context, {
        textAlign,
        textBaseline,
        bgColor: buttonBgColor,
        color,
        font,
        padding,
        shadow: active
          ? {
              color: "rgba(0, 0, 0, 0.48)",
              blur: 6,
              offsetY: 3
            }
          : {},
        textOverflow,
        icons
      });
    });
  }
}

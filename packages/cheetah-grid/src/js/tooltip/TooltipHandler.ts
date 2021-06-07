import type { CellRange, ListGridAPI } from "../ts-types";
import type { BaseTooltip } from "./BaseTooltip";
import { LG_EVENT_TYPE } from "../list-grid/LG_EVENT_TYPE";
import { Tooltip } from "./Tooltip";
import { cellInRange } from "../internal/utils";

const TOOLTIP_INSTANCE_FACTORY = {
  "overflow-text"<T>(grid: ListGridAPI<T>): BaseTooltip<T> {
    return new Tooltip(grid);
  },
};

function getTooltipInstanceInfo<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grid: ListGridAPI<T>,
  col: number,
  row: number
): {
  type: "overflow-text";
  content: string;
} | null {
  //
  // overflow text tooltip
  const overflowText = grid.getCellOverflowText(col, row);
  if (overflowText) {
    return {
      type: "overflow-text",
      content: overflowText,
    };
  }
  return null;
}

type AttachInfo<T> = {
  instance: BaseTooltip<T>;
  range: CellRange;
};

export class TooltipHandler<T> {
  private _grid: ListGridAPI<T>;
  private _tooltipInstances: { [type: string]: BaseTooltip<T> };
  private _attachInfo?: AttachInfo<T> | null;
  constructor(grid: ListGridAPI<T>) {
    this._grid = grid;
    this._tooltipInstances = {};
    this._bindGridEvent(grid);
  }
  dispose(): void {
    const tooltipInstances = this._tooltipInstances;
    for (const k in tooltipInstances) {
      tooltipInstances[k].dispose();
    }
    // @ts-expect-error -- ignore
    delete this._tooltipInstances;
    this._attachInfo = null;
  }
  _attach(col: number, row: number): void {
    const info = this._attachInfo;
    const instanceInfo = this._getTooltipInstanceInfo(col, row);
    if (info && (!instanceInfo || info.instance !== instanceInfo.instance)) {
      info.instance.detachTooltipElement();
      this._attachInfo = null;
    }
    if (!instanceInfo) {
      return;
    }
    const { instance } = instanceInfo;
    instance.attachTooltipElement(col, row, instanceInfo.content);
    const range = this._grid.getCellRange(col, row);
    this._attachInfo = { range, instance };
  }
  _move(col: number, row: number): void {
    const info = this._attachInfo;
    if (!info || !cellInRange(info.range, col, row)) {
      return;
    }
    const { instance } = info;
    instance.moveTooltipElement(col, row);
  }
  _detach(): void {
    const info = this._attachInfo;
    if (!info) {
      return;
    }
    const { instance } = info;
    instance.detachTooltipElement();
    this._attachInfo = null;
  }
  _isAttachCell(col: number, row: number): boolean {
    const info = this._attachInfo;
    if (!info) {
      return false;
    }
    return cellInRange(info.range, col, row);
  }
  _bindGridEvent(grid: ListGridAPI<T>): void {
    grid.listen(LG_EVENT_TYPE.MOUSEOVER_CELL, (e) => {
      if (e.related) {
        if (this._isAttachCell(e.col, e.row)) {
          return;
        }
      }
      this._attach(e.col, e.row);
    });
    grid.listen(LG_EVENT_TYPE.MOUSEOUT_CELL, (e) => {
      if (e.related) {
        if (this._isAttachCell(e.related.col, e.related.row)) {
          return;
        }
      }
      this._detach();
    });
    grid.listen(LG_EVENT_TYPE.SELECTED_CELL, (e) => {
      if (this._isAttachCell(e.col, e.row)) {
        this._detach();
      }
    });
    grid.listen(LG_EVENT_TYPE.SCROLL, () => {
      const info = this._attachInfo;
      if (!info) {
        return;
      }
      this._move(info.range.start.col, info.range.start.row);
    });
    grid.listen(LG_EVENT_TYPE.CHANGED_VALUE, (e) => {
      if (this._isAttachCell(e.col, e.row)) {
        this._detach();
        this._attach(e.col, e.row);
      }
    });
  }
  _getTooltipInstanceInfo(
    col: number,
    row: number
  ): {
    instance: Tooltip<T>;
    type: string;
    content: string;
  } | null {
    const grid = this._grid;
    const tooltipInstances = this._tooltipInstances;
    const info = getTooltipInstanceInfo(grid, col, row);
    if (!info) {
      return null;
    }
    const { type } = info;
    const instance =
      tooltipInstances[type] ||
      (tooltipInstances[type] = TOOLTIP_INSTANCE_FACTORY[type](grid));
    return {
      instance,
      type,
      content: info.content,
    };
  }
}

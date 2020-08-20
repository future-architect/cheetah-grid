import type { ListGridAPI } from "../ts-types";
import type { TooltipElement } from "./internal/TooltipElement";

export abstract class BaseTooltip<T> {
  private _grid: ListGridAPI<T>;
  private _tooltipElement?: TooltipElement<T>;
  constructor(grid: ListGridAPI<T>) {
    this._grid = grid;
  }
  dispose(): void {
    this.detachTooltipElement();
    if (this._tooltipElement) {
      this._tooltipElement.dispose();
    }
    this._tooltipElement = undefined;
  }
  private _getTooltipElement(): TooltipElement<T> {
    if (this._tooltipElement) {
      return this._tooltipElement;
    }
    return (this._tooltipElement = this.createTooltipElementInternal());
  }
  abstract createTooltipElementInternal(): TooltipElement<T>;
  attachTooltipElement(col: number, row: number, content: string): void {
    const tooltipElement = this._getTooltipElement();
    tooltipElement.attach(this._grid, col, row, content);
  }
  moveTooltipElement(col: number, row: number): void {
    const tooltipElement = this._getTooltipElement();
    tooltipElement.move(this._grid, col, row);
  }
  detachTooltipElement(): void {
    const tooltipElement = this._getTooltipElement();
    tooltipElement._detach();
  }
}

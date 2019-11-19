import { BaseTooltip } from "./BaseTooltip";
import { TooltipElement } from "./internal/TooltipElement";

export class Tooltip<T> extends BaseTooltip<T> {
  createTooltipElementInternal(): TooltipElement<T> {
    return new TooltipElement();
  }
}

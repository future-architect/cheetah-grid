import { DG_EVENT_TYPE } from "../core/DG_EVENT_TYPE";
import type { DrawGridEvents } from "../core/DG_EVENT_TYPE";
import { extend } from "../internal/utils";

export interface ListGridEvents extends DrawGridEvents {
  /**
   * Indicates when the cell value was changed.
   */
  CHANGED_VALUE: "changed_value";
  /**
   * Indicates when the header cell value was changed.
   */
  CHANGED_HEADER_VALUE: "changed_header_value";
}

export const LG_EVENT_TYPE: ListGridEvents = extend(DG_EVENT_TYPE, {
  CHANGED_VALUE: "changed_value" as const,
  CHANGED_HEADER_VALUE: "changed_header_value" as const,
});

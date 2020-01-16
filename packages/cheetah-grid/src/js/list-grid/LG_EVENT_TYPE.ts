import { DG_EVENT_TYPE, DrawGridEvents } from "../core/DG_EVENT_TYPE";
import { extend } from "../internal/utils";

export interface ListGidEvents extends DrawGridEvents {
  /**
   * Indicates when the cell value was changed.
   */
  CHANGED_VALUE: "changed_value";
  /**
   * Indicates when the header cell value was changed.
   */
  CHANGED_HEADER_VALUE: "changed_header_value";
}

export const LG_EVENT_TYPE: ListGidEvents = extend(DG_EVENT_TYPE, {
  CHANGED_VALUE: "changed_value" as "changed_value",
  CHANGED_HEADER_VALUE: "changed_header_value" as "changed_header_value"
});

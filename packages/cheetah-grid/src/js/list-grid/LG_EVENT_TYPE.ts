import { DG_EVENT_TYPE } from "../core/DG_EVENT_TYPE";
import type { DrawGridEvents } from "../core/DG_EVENT_TYPE";
import { extend } from "../internal/utils";

export interface ListGridEvents extends DrawGridEvents {
  /**
   * Notify before a cell value changes.
   */
  BEFORE_CHANGE_VALUE: "before_change_value";
  /**
   * Indicates when the cell value was changed.
   */
  CHANGED_VALUE: "changed_value";
  /**
   * Indicates when the header cell value was changed.
   */
  CHANGED_HEADER_VALUE: "changed_header_value";
  /**
   * Indicates that the pasted value has been rejected.
   */
  REJECTED_PASTE_VALUES: "rejected_paste_values";
}

export const LG_EVENT_TYPE: ListGridEvents = extend(DG_EVENT_TYPE, {
  BEFORE_CHANGE_VALUE: "before_change_value" as const,
  CHANGED_VALUE: "changed_value" as const,
  CHANGED_HEADER_VALUE: "changed_header_value" as const,
  REJECTED_PASTE_VALUES: "rejected_paste_values" as const,
});

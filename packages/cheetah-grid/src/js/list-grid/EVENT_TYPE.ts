import {
  EVENT_TYPE as BASE_EVENT_TYPE,
  DrawGridEvents
} from "../core/EVENT_TYPE";
import { extend } from "../internal/utils";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface ListGidEvents extends DrawGridEvents {
  CHANGED_VALUE: "changed_value";
  CHANGED_HEADER_VALUE: "changed_header_value";
}

export const EVENT_TYPE: ListGidEvents = extend(BASE_EVENT_TYPE, {
  CHANGED_VALUE: "changed_value" as "changed_value",
  CHANGED_HEADER_VALUE: "changed_header_value" as "changed_header_value"
});

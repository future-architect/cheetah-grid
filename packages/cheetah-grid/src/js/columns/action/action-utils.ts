import type { ListGridAPI } from "../../ts-types";
import { isPromise } from "../../internal/utils";

export function isDisabledRecord<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: boolean | ((record: any) => boolean),
  grid: ListGridAPI<T>,
  row: number
): boolean {
  if (grid.disabled) {
    return true;
  }
  return getBooleanOptionOfRecord(option, grid, row);
}
export function isReadOnlyRecord<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: boolean | ((record: any) => boolean),
  grid: ListGridAPI<T>,
  row: number
): boolean {
  if (grid.readOnly) {
    return true;
  }
  return getBooleanOptionOfRecord(option, grid, row);
}

export function toggleValue(val: number): number;
export function toggleValue(val: string): string;
export function toggleValue(val: unknown): boolean;
export function toggleValue(
  val: number | string | unknown
): number | string | boolean {
  if (typeof val === "number") {
    if (val === 0) {
      return 1;
    } else {
      return 0;
    }
  } else if (typeof val === "string") {
    if (val === "false") {
      return "true";
    } else if (val === "off") {
      return "on";
    } else if (/^0+$/.exec(val)) {
      return val.replace(/^(0*)0$/, "$11");
    } else if (val === "true") {
      return "false";
    } else if (val === "on") {
      return "off";
    } else if (/^0*1$/.exec(val)) {
      return val.replace(/^(0*)1$/, "$10");
    }
  }
  return !val;
}

function getBooleanOptionOfRecord<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: boolean | ((record: any) => boolean),
  grid: ListGridAPI<T>,
  row: number
): boolean {
  if (typeof option === "function") {
    const record = grid.getRowRecord(row);
    if (isPromise(record)) {
      return true;
    }
    return !!option(record);
  }
  return !!option;
}

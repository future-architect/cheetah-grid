import { ListGridAPI } from "../../ts-types";
import { isPromise } from "../../internal/utils";

export function isDisabledRecord<T>(
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
export function isReadOnlyRecord<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: boolean | ((record: any) => boolean),
  grid: ListGridAPI<T>,
  row: number
): boolean {
  return isDisabledRecord(option, grid, row);
}

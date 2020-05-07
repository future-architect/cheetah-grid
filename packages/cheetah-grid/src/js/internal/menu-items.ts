import type { ColumnMenuItemOption, ColumnMenuItemOptions } from "../ts-types";
/** @private */
function extend<T, U>(a: T, b: U): T & U {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: any = {};
  for (const k in a) {
    o[k] = a[k];
  }
  for (const k in b) {
    o[k] = b[k];
  }
  return o;
}

/**
 * Normalize the given menu options.
 * @param {*} options menu options to given
 * @returns {Array} Normalized options
 * @private
 */
export function normalize(
  options: ColumnMenuItemOptions | undefined
): ColumnMenuItemOption[] {
  if (!options) {
    return [];
  }
  if (Array.isArray(options)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (options as any).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any): ColumnMenuItemOption =>
        extend(e, { label: e.caption || e.label })
    );
  }
  if (typeof options === "string") {
    return normalize(JSON.parse(options));
  }
  const result = [];
  for (const k in options) {
    result.push({
      value: k,
      label: options[k],
    });
  }
  return result;
}

/**
 * Normalize the given menu options.
 * @param {*} options menu options to given
 * @returns {Array} Normalized options
 * @private
 */
export function normalizeToFn<T>(
  options:
    | ColumnMenuItemOptions
    | ((record: T | undefined) => ColumnMenuItemOptions)
    | undefined
): (record: T | undefined) => ColumnMenuItemOption[] {
  if (typeof options === "function") {
    return (record: T | undefined): ColumnMenuItemOption[] =>
      normalize(options(record));
  }
  return (): ColumnMenuItemOption[] => normalize(options);
}

import type { ColumnMenuItemOption, ColumnMenuItemOptions } from "../ts-types";

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
      (e: any): ColumnMenuItemOption => ({
        value: e.value,
        label: e.caption || e.label,
        classList: e.classList,
        html: e.html,
      })
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

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
    return options;
  }
  if (typeof options === "string") {
    return normalize(JSON.parse(options));
  }
  const result = [];
  for (const k in options) {
    result.push({
      value: k,
      caption: options[k],
    });
  }
  return result;
}

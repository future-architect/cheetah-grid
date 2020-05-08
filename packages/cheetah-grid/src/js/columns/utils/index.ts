export function toBoolean(val: unknown): boolean {
  if (typeof val === "string") {
    if (val === "false") {
      return false;
    } else if (val === "off") {
      return false;
    } else if (/^0+$/.exec(val)) {
      return false;
    }
  }
  return Boolean(val);
}

export function getInternal(): unknown {
  console.warn("use internal!!");
  return {
    color: require("./internal/color"),
    sort: require("./internal/sort"),
    calc: require("./internal/calc"),
    symbolManager: require("./internal/symbolManager"),
    path2DManager: require("./internal/path2DManager"),
  };
}

import * as calc from "./internal/calc";
import * as color from "./internal/color";
import * as pasteUtils from "./internal/paste-utils";
import * as path2DManager from "./internal/path2DManager";
import * as sort from "./internal/sort";
import * as symbolManager from "./internal/symbolManager";
export function getInternal(): unknown {
  console.warn("use internal!!");
  return {
    color,
    sort,
    calc,
    symbolManager,
    path2DManager,
    pasteUtils,
  };
}

import * as TYPES from "./ts-types";
import * as columns from "./columns";
import * as core from "./core";
import * as data from "./data";
import * as headers from "./headers";
import * as icons from "./icons";
import * as register from "./register";
import * as themes from "./themes";
import * as tools from "./tools";
import {
  ColumnDefine,
  GroupHeaderDefine,
  HeaderDefine,
  HeadersDefine,
  ListGrid,
  ListGridConstructorOptions
} from "./ListGrid";
import { GridCanvasHelper } from "./GridCanvasHelper";
import { Theme } from "./themes/theme";

/**
 * Cheetah Grid
 * @type {Object}
 * @namespace cheetahGrid
 */
export {
  TYPES,
  core,
  tools,
  // impl Grids
  ListGrid,
  // ListGrid types
  ListGridConstructorOptions,
  HeadersDefine,
  ColumnDefine,
  HeaderDefine,
  GroupHeaderDefine,
  // objects
  columns,
  headers,
  themes,
  data,
  // helper
  GridCanvasHelper,
  //plugin registers
  register
};

export function getIcons(): { [key: string]: TYPES.IconDefine } {
  return icons.get();
}

export function _getInternal(): unknown {
  console.warn("use internal!!");
  return {
    color: require("./internal/color"),
    sort: require("./internal/sort"),
    calc: require("./internal/calc"),
    symbolManager: require("./internal/symbolManager"),
    path2DManager: require("./internal/path2DManager")
  };
}

// backward compatibility
export default {
  TYPES,
  core,
  tools,
  // impl Grids
  ListGrid,
  // objects
  columns,
  headers,
  themes,
  data,
  // helper
  GridCanvasHelper,
  //plugin registers
  register,
  get icons(): { [key: string]: TYPES.IconDefine } {
    return getIcons();
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.defineProperty(themes as any, "default", {
  enumerable: false,
  configurable: true,
  get() {
    return themes.getDefault();
  },
  set(defaultTheme: Theme): void {
    themes.setDefault(defaultTheme);
  }
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.defineProperty(themes as any, "choices", {
  enumerable: false,
  configurable: true,
  get() {
    return themes.getChoices();
  }
});

// backward compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(core.DrawGrid as any).EVENT_TYPE = core.EVENT_TYPE;

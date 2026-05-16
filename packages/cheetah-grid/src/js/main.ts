import type * as TYPES from "./ts-types";
import * as columns from "./columns";
import * as core from "./core";
import * as data from "./data";
import * as headers from "./headers";
import * as icons from "./icons";
import * as register from "./register";
import * as themesModule from "./themes";
import * as tools from "./tools";
import { ListGrid } from "./ListGrid";
import type {
  ColumnDefine,
  GroupHeaderDefine,
  HeaderDefine,
  HeadersDefine,
  ListGridConstructorOptions,
} from "./ListGrid";
import { GridCanvasHelper } from "./GridCanvasHelper";
import type { Theme } from "./themes/theme";

const themes = { ...themesModule };

export { getInternal as _getInternal } from "./get-internal";

/**
 * Cheetah Grid
 * @namespace cheetahGrid
 */
export {
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
  getIcons,
  //plugin registers
  register,
};

export type {
  /**
   * Types
   * @namespace cheetahGrid.TYPES
   */
  TYPES,
};

/** @private */
function getIcons(): { [key: string]: TYPES.IconDefine } {
  return icons.get();
}

// backward compatibility
export default {
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
  },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.defineProperty(themes as any, "default", {
  enumerable: false,
  configurable: true,
  get() {
    return themesModule.getDefault();
  },
  set(defaultTheme: Theme): void {
    themesModule.setDefault(defaultTheme);
  },
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.defineProperty(themes as any, "choices", {
  enumerable: false,
  configurable: true,
  get() {
    return themesModule.getChoices();
  },
});

import {
  ColorPropertyDefine,
  ColorsPropertyDefine,
  PartialThemeDefine,
  RequiredThemeDefine,
  ThemeDefine
} from "../ts-types";
import { getChainSafe } from "../internal/utils";
import { get as getSymbol } from "../internal/symbolManager";
//private symbol
const _ = getSymbol();

function getProp<T extends ColorPropertyDefine | ColorsPropertyDefine>(
  obj: PartialThemeDefine,
  superObj: ThemeDefine,
  names: string[],
  defNames?: string[]
): T {
  return (
    getChainSafe(obj, ...names) ||
    getChainSafe(superObj, ...names) ||
    (defNames && getChainSafe(obj, ...defNames)) ||
    (defNames && getChainSafe(superObj, ...defNames))
  );
}

export class Theme implements RequiredThemeDefine {
  private [_]: {
    obj: PartialThemeDefine;
    superTheme: ThemeDefine;
  };
  private _checkbox: RequiredThemeDefine["checkbox"] | null = null;
  private _button: RequiredThemeDefine["button"] | null = null;
  private _header: RequiredThemeDefine["header"] | null = null;
  constructor(obj: ThemeDefine);
  constructor(obj: PartialThemeDefine, superTheme: ThemeDefine);
  constructor(obj: PartialThemeDefine | ThemeDefine, superTheme?: ThemeDefine) {
    this[_] = {
      obj,
      superTheme: superTheme as ThemeDefine
    };
  }
  get font(): string {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["font"]);
  }
  get underlayBackgroundColor(): string {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["underlayBackgroundColor"]);
  }
  // color
  get color(): ColorPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["color"]);
  }
  get frozenRowsColor(): ColorPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["frozenRowsColor"], ["color"]);
  }
  // background
  get defaultBgColor(): ColorPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["defaultBgColor"]);
  }
  get frozenRowsBgColor(): ColorPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["frozenRowsBgColor"], ["defaultBgColor"]);
  }
  get selectionBgColor(): ColorPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["selectionBgColor"], ["defaultBgColor"]);
  }
  // border
  get borderColor(): ColorsPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["borderColor"]);
  }
  get frozenRowsBorderColor(): ColorsPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["frozenRowsBorderColor"], ["borderColor"]);
  }
  get highlightBorderColor(): ColorsPropertyDefine {
    const { obj, superTheme } = this[_];
    return getProp(obj, superTheme, ["highlightBorderColor"], ["borderColor"]);
  }
  get checkbox(): RequiredThemeDefine["checkbox"] {
    const { obj, superTheme } = this[_];
    return (
      this._checkbox ||
      (this._checkbox = {
        get uncheckBgColor(): ColorPropertyDefine {
          return getProp(
            obj,
            superTheme,
            ["checkbox", "uncheckBgColor"],
            ["defaultBgColor"]
          );
        },
        get checkBgColor(): ColorPropertyDefine {
          return getProp(
            obj,
            superTheme,
            ["checkbox", "checkBgColor"],
            ["defaultBgColor"]
          );
        },
        get borderColor(): ColorPropertyDefine {
          return getProp(
            obj,
            superTheme,
            ["checkbox", "borderColor"],
            ["borderColor"]
          );
        }
      })
    );
  }
  get button(): RequiredThemeDefine["button"] {
    const { obj, superTheme } = this[_];
    return (
      this._button ||
      (this._button = {
        get color(): ColorPropertyDefine {
          return getProp(obj, superTheme, ["button", "color"], ["color"]);
        },
        get bgColor(): ColorPropertyDefine {
          return getProp(
            obj,
            superTheme,
            ["button", "bgColor"],
            ["defaultBgColor"]
          );
        }
      })
    );
  }
  get header(): RequiredThemeDefine["header"] {
    const { obj, superTheme } = this[_];
    return (
      this._header ||
      (this._header = {
        get sortArrowColor(): ColorPropertyDefine {
          return getProp(
            obj,
            superTheme,
            ["header", "sortArrowColor"],
            ["color"]
          );
        }
      })
    );
  }
  extends(obj: PartialThemeDefine): Theme {
    return new Theme(obj, this);
  }
}

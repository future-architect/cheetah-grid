import type {
  ColorPropertyDefine,
  ColorsPropertyDefine,
  PartialThemeDefine,
  RequiredThemeDefine,
  StylePropertyFunctionArg,
  ThemeDefine,
  TreeBranchIconStyleDefine,
  TreeLineStyle,
} from "../ts-types";
import { getChainSafe } from "../internal/utils";
import { get as getSymbol } from "../internal/symbolManager";
import { getTreeNodeInfoAt } from "../columns/type/TreeColumn";
//private symbol
const _ = getSymbol();

function getProp<T>(
  obj: PartialThemeDefine,
  superObj: ThemeDefine,
  names: string[],
  defNames?: string[],
  convertForSuper?: (value: never) => T | undefined,
  defaultValue?: T
): T {
  const value = getChainSafe(obj, ...names) || getChainSafe(superObj, ...names);
  if (value) {
    return value;
  }
  if (!defNames) {
    return value || defaultValue;
  }
  const getChainSafeWithConvert = convertForSuper
    ? (obj: PartialThemeDefine, ...names: string[]) => {
        const value = getChainSafe(obj, ...names);
        if (!value) {
          return value;
        }
        return convertForSuper(value as never);
      }
    : getChainSafe;
  return (
    getChainSafeWithConvert(obj, ...defNames) ||
    getChainSafeWithConvert(superObj, ...defNames) ||
    defaultValue
  );
}

export class Theme implements RequiredThemeDefine {
  private [_]: {
    obj: PartialThemeDefine;
    superTheme: ThemeDefine;
  };
  private _checkbox: RequiredThemeDefine["checkbox"] | null = null;
  private _radioButton: RequiredThemeDefine["radioButton"] | null = null;
  private _button: RequiredThemeDefine["button"] | null = null;
  private _tree: RequiredThemeDefine["tree"] | null = null;
  private _header: RequiredThemeDefine["header"] | null = null;
  private _messages: RequiredThemeDefine["messages"] | null = null;
  private _indicators: RequiredThemeDefine["indicators"] | null = null;
  constructor(obj: ThemeDefine);
  constructor(obj: PartialThemeDefine, superTheme: ThemeDefine);
  constructor(obj: PartialThemeDefine | ThemeDefine, superTheme?: ThemeDefine) {
    this[_] = {
      obj,
      superTheme: superTheme as ThemeDefine,
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
  get highlightBgColor(): ColorPropertyDefine {
    if (this.hasProperty(["highlightBgColor"])) {
      const { obj, superTheme } = this[_];
      return getProp(obj, superTheme, ["highlightBgColor"]);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (args: StylePropertyFunctionArg): any => {
      const color =
        args.row < args.grid.frozenRowCount
          ? this.frozenRowsBgColor
          : this.defaultBgColor;
      if (typeof color === "function") {
        return color(args);
      }
      return color;
    };
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
          return getCheckboxProp("uncheckBgColor", ["defaultBgColor"]);
        },
        get checkBgColor(): ColorPropertyDefine {
          return getCheckboxProp(
            "checkBgColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get borderColor(): ColorPropertyDefine {
          return getCheckboxProp(
            "borderColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
      })
    );
    function getCheckboxProp(
      prop: string,
      defNames: string[],
      convertForSuper?: (value: never) => ColorPropertyDefine | undefined,
      defaultValue?: ColorPropertyDefine
    ): ColorPropertyDefine {
      return getProp(
        obj,
        superTheme,
        ["checkbox", prop],
        defNames,
        convertForSuper,
        defaultValue
      );
    }
  }
  get radioButton(): RequiredThemeDefine["radioButton"] {
    const { obj, superTheme } = this[_];
    return (
      this._radioButton ||
      (this._radioButton = {
        get checkColor(): ColorPropertyDefine {
          return getRadioButtonProp("checkColor", ["color"]);
        },
        get uncheckBorderColor(): ColorPropertyDefine {
          return getRadioButtonProp(
            "uncheckBorderColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get checkBorderColor(): ColorPropertyDefine {
          return getRadioButtonProp(
            "checkBorderColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get uncheckBgColor(): ColorPropertyDefine {
          return getRadioButtonProp("uncheckBgColor", ["defaultBgColor"]);
        },
        get checkBgColor(): ColorPropertyDefine {
          return getRadioButtonProp("checkBgColor", ["defaultBgColor"]);
        },
      })
    );
    function getRadioButtonProp(
      prop: string,
      defNames: string[],
      convertForSuper?: (value: never) => ColorPropertyDefine | undefined,
      defaultValue?: ColorPropertyDefine
    ): ColorPropertyDefine {
      return getProp(
        obj,
        superTheme,
        ["radioButton", prop],
        defNames,
        convertForSuper,
        defaultValue
      );
    }
  }
  get button(): RequiredThemeDefine["button"] {
    const { obj, superTheme } = this[_];
    return (
      this._button ||
      (this._button = {
        get color(): ColorPropertyDefine {
          return getButtonProp("color", ["color"]);
        },
        get bgColor(): ColorPropertyDefine {
          return getButtonProp("bgColor", ["defaultBgColor"]);
        },
      })
    );
    function getButtonProp(
      prop: string,
      defNames: string[]
    ): ColorPropertyDefine {
      return getProp(obj, superTheme, ["button", prop], defNames);
    }
  }
  get tree(): RequiredThemeDefine["tree"] {
    const { obj, superTheme } = this[_];
    return (
      this._tree ||
      (this._tree = {
        get lineStyle(): TreeLineStyle {
          return getTreeProp("lineStyle", undefined, undefined, "solid");
        },
        get lineColor(): ColorPropertyDefine {
          return getTreeProp(
            "lineColor",
            ["borderColor"],
            colorsToColor,
            "#0000"
          );
        },
        get lineWidth(): number {
          return getTreeProp("lineWidth", undefined, undefined, 1);
        },
        get treeIcon(): TreeBranchIconStyleDefine {
          return getTreeProp<TreeBranchIconStyleDefine>(
            "treeIcon",
            undefined,
            undefined,
            (args) => {
              const { hasChildren, nodeType } = getTreeNodeInfoAt(args);
              if (hasChildren) {
                return "expand_more";
              }
              return nodeType === "branch" ? "chevron_right" : "none";
            }
          );
        },
      })
    );
    function getTreeProp<
      T extends
        | ColorPropertyDefine
        | number
        | TreeLineStyle
        | TreeBranchIconStyleDefine
    >(
      prop: string,
      defNames: string[] | undefined,
      convertForSuper?: (value: never) => T | undefined,
      defaultValue?: T
    ): T {
      return getProp(
        obj,
        superTheme,
        ["tree", prop],
        defNames,
        convertForSuper,
        defaultValue
      );
    }
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
        },
      })
    );
  }
  get messages(): RequiredThemeDefine["messages"] {
    const { obj, superTheme } = this[_];
    return (
      this._messages ||
      (this._messages = {
        get infoBgColor(): ColorPropertyDefine {
          return getMessageProp("infoBgColor");
        },
        get errorBgColor(): ColorPropertyDefine {
          return getMessageProp("errorBgColor");
        },
        get warnBgColor(): ColorPropertyDefine {
          return getMessageProp("warnBgColor");
        },
        get boxWidth(): number {
          return getMessageProp("boxWidth");
        },
        get markHeight(): number {
          return getMessageProp("markHeight");
        },
      })
    );
    function getMessageProp<T extends ColorPropertyDefine | number>(
      prop: string
    ): T {
      return getProp(obj, superTheme, ["messages", prop]);
    }
  }
  get indicators(): RequiredThemeDefine["indicators"] {
    const { obj, superTheme } = this[_];
    return (
      this._indicators ||
      (this._indicators = {
        get topLeftColor(): ColorPropertyDefine {
          return getIndicatorsProp(
            "topLeftColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get topLeftSize(): number {
          return getIndicatorsProp("topLeftSize");
        },
        get topRightColor(): ColorPropertyDefine {
          return getIndicatorsProp(
            "topRightColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get topRightSize(): number {
          return getIndicatorsProp("topRightSize");
        },
        get bottomRightColor(): ColorPropertyDefine {
          return getIndicatorsProp(
            "bottomRightColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get bottomRightSize(): number {
          return getIndicatorsProp("bottomRightSize");
        },
        get bottomLeftColor(): ColorPropertyDefine {
          return getIndicatorsProp(
            "bottomLeftColor",
            ["borderColor"],
            colorsToColor,
            "#000"
          );
        },
        get bottomLeftSize(): number {
          return getIndicatorsProp("bottomLeftSize");
        },
      })
    );

    function getIndicatorsProp<T extends ColorPropertyDefine | number>(
      prop: string,
      defNames?: string[],
      convertForSuper?: (value: never) => T | undefined,
      defaultValue?: T
    ): T {
      return getProp(
        obj,
        superTheme,
        ["indicators", prop],
        defNames,
        convertForSuper,
        defaultValue
      );
    }
  }
  hasProperty(names: string[]): boolean {
    const { obj, superTheme } = this[_];
    return hasThemeProperty(obj, names) || hasThemeProperty(superTheme, names);
  }
  extends(obj: PartialThemeDefine): Theme {
    return new Theme(obj, this);
  }
}

function hasThemeProperty(obj: PartialThemeDefine, names: string[]): boolean {
  if (obj instanceof Theme) {
    return obj.hasProperty(names);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let o: any = obj;
    if (!o) {
      return false;
    }
    for (let index = 0; index < names.length; index++) {
      const name = names[index];
      o = o[name];
      if (!o) {
        return false;
      }
    }
    return !!o;
  }
}

function colorsToColor(
  colors: ColorsPropertyDefine
): ColorPropertyDefine | undefined {
  if (typeof colors === "function") {
    return (arg): string | CanvasGradient | CanvasPattern | undefined => {
      const val = colors(arg);
      return val ? colorsArrayToColor(val) : val;
    };
  }
  return colorsArrayToColor(colors);

  function colorsArrayToColor(
    // eslint-disable-next-line @typescript-eslint/ban-types
    colors: Exclude<ColorsPropertyDefine, Function>
  ) {
    if (!Array.isArray(colors)) {
      return colors;
    }
    return colors.find(Boolean) || undefined;
  }
}

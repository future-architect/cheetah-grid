import type {
  ColorPropertyDefine,
  ColorsPropertyDefine,
  TreeBranchIconStyleDefine,
  TreeLineStyle,
} from "./define";

// ****** Plugin Icons *******
export interface IconDefine {
  d: string;
  width: number;
  height: number;
}

// ****** Custom Theme *******
export type PartialThemeDefine = Partial<ThemeDefine>;

export interface ThemeDefine {
  font?: string;
  underlayBackgroundColor: string;
  // color
  color: ColorPropertyDefine;
  frozenRowsColor?: ColorPropertyDefine;
  // background
  defaultBgColor?: ColorPropertyDefine;
  frozenRowsBgColor?: ColorPropertyDefine;
  selectionBgColor: ColorPropertyDefine;
  highlightBgColor?: ColorPropertyDefine;
  // border
  borderColor: ColorsPropertyDefine;
  frozenRowsBorderColor: ColorsPropertyDefine;
  highlightBorderColor: ColorsPropertyDefine;
  checkbox: {
    uncheckBgColor?: ColorPropertyDefine;
    checkBgColor?: ColorPropertyDefine;
    borderColor?: ColorPropertyDefine;
  };
  radioButton: {
    checkColor?: ColorPropertyDefine;
    uncheckBorderColor?: ColorPropertyDefine;
    checkBorderColor?: ColorPropertyDefine;
    uncheckBgColor?: ColorPropertyDefine;
    checkBgColor?: ColorPropertyDefine;
  };
  button: {
    color?: ColorPropertyDefine;
    bgColor?: ColorPropertyDefine;
  };
  tree: {
    lineStyle?: TreeLineStyle;
    lineColor?: ColorPropertyDefine;
    lineWidth?: number;
    treeIcon?: TreeBranchIconStyleDefine;
  };
  header: {
    sortArrowColor?: ColorPropertyDefine;
  };
  messages: {
    infoBgColor?: ColorPropertyDefine;
    errorBgColor?: ColorPropertyDefine;
    warnBgColor?: ColorPropertyDefine;
    boxWidth?: number; // Default 24
    markHeight?: number; // Default 20
  };
  indicators: {
    topLeftColor?: ColorPropertyDefine;
    topLeftSize?: number;
    topRightColor?: ColorPropertyDefine;
    topRightSize?: number;
    bottomRightColor?: ColorPropertyDefine;
    bottomRightSize?: number;
    bottomLeftColor?: ColorPropertyDefine;
    bottomLeftSize?: number;
  };
}

export type RequiredThemeDefine = Required<ThemeDefine> & {
  checkbox: Required<ThemeDefine["checkbox"]>;
  radioButton: Required<ThemeDefine["radioButton"]>;
  button: Required<ThemeDefine["button"]>;
  tree: Required<ThemeDefine["tree"]>;
  header: Required<ThemeDefine["header"]>;
  messages: Required<ThemeDefine["messages"]>;
  indicators: Required<ThemeDefine["indicators"]>;
};

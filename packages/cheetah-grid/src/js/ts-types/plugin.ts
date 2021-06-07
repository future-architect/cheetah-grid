import type { ColorPropertyDefine, ColorsPropertyDefine } from "./define";

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
  header: {
    sortArrowColor?: ColorPropertyDefine;
  };
  messages: {
    infoBgColor?: ColorPropertyDefine;
    errorBgColor?: ColorPropertyDefine;
    warnBgColor?: ColorPropertyDefine;
  };
}

export type RequiredThemeDefine = Required<ThemeDefine> & {
  checkbox: Required<ThemeDefine["checkbox"]>;
  radioButton: Required<ThemeDefine["radioButton"]>;
  button: Required<ThemeDefine["button"]>;
  header: Required<ThemeDefine["header"]>;
  messages: Required<ThemeDefine["messages"]>;
};

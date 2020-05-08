import type { LineClamp, TextOverflow } from "../define";
import type { ColorDef } from "../base";

export interface ColumnStyle {
  bgColor?: ColorDef;
  doChangeStyle(): void;
  clone(): ColumnStyle;
}

export interface BaseStyleOption {
  bgColor?: ColorDef;
}

export interface StdBaseStyleOption extends BaseStyleOption {
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export interface StyleOption extends StdBaseStyleOption {
  color?: ColorDef;
  font?: string;
  padding?: number | string | (number | string)[];
  textOverflow?: TextOverflow;
}
export interface HeaderStdStyleOption extends StdBaseStyleOption {
  color?: ColorDef;
  font?: string;
  textOverflow?: TextOverflow;
}

export interface ButtonStyleOption extends StyleOption {
  buttonBgColor?: ColorDef;
}

export interface CheckStyleOption extends StdBaseStyleOption {
  uncheckBgColor?: ColorDef;
  checkBgColor?: ColorDef;
  borderColor?: ColorDef;
}

export interface RadioStyleOption extends StdBaseStyleOption {
  checkColor?: ColorDef;
  uncheckBorderColor?: ColorDef;
  checkBorderColor?: ColorDef;
  uncheckBgColor?: ColorDef;
  checkBgColor?: ColorDef;
}

export interface CheckHeaderStyleOption extends HeaderStdStyleOption {
  uncheckBgColor?: ColorDef;
  checkBgColor?: ColorDef;
  borderColor?: ColorDef;
}

export type NumberStyleOption = StyleOption;

export interface MultilineTextStyleOption extends StyleOption {
  lineHeight?: string | number;
  autoWrapText?: boolean;
  lineClamp?: LineClamp;
}

export interface MultilineTextHeaderStyleOption extends HeaderStdStyleOption {
  lineHeight?: string | number;
  autoWrapText?: boolean;
  lineClamp?: LineClamp;
}

export interface MenuStyleOption extends StyleOption {
  appearance?: "menulist-button" | "none";
}
export interface ImageStyleOption extends StdBaseStyleOption {
  imageSizing?: "keep-aspect-ratio";
  margin?: number;
}

export type IconStyleOption = StyleOption;

export interface BranchGraphStyleOption extends BaseStyleOption {
  branchColors?: ColorDef | ((name: string, index: number) => ColorDef);
  margin?: number;
  circleSize?: number;
  branchLineWidth?: number;
  mergeStyle?: "straight" | "bezier";
}

export interface PercentCompleteBarStyleOption extends StyleOption {
  barColor?: ColorDef | ((num: number) => ColorDef);
  barBgColor?: ColorDef;
  barHeight?: number;
}

export interface SortHeaderStyleOption extends HeaderStdStyleOption {
  sortArrowColor?: ColorDef;
}

export type ColumnStyleOption =
  | string
  | ColumnStyle
  | BaseStyleOption
  | StdBaseStyleOption
  | StyleOption
  | ButtonStyleOption
  | CheckStyleOption
  | NumberStyleOption
  | MultilineTextStyleOption
  | MenuStyleOption
  | ImageStyleOption
  | IconStyleOption
  | BranchGraphStyleOption
  | PercentCompleteBarStyleOption

  /* eslint-disable @typescript-eslint/no-explicit-any */
  | ((
      record: any
    ) =>
      | string
      | ColumnStyle
      | BaseStyleOption
      | StdBaseStyleOption
      | StyleOption
      | ButtonStyleOption
      | CheckStyleOption
      | NumberStyleOption
      | MultilineTextStyleOption
      | MenuStyleOption
      | ImageStyleOption
      | IconStyleOption
      | BranchGraphStyleOption
      | PercentCompleteBarStyleOption);
/* eslint-enable @typescript-eslint/no-explicit-any */

export type HeaderStyleOption =
  | ColumnStyle
  | BaseStyleOption
  | HeaderStdStyleOption
  | CheckHeaderStyleOption
  | MultilineTextHeaderStyleOption
  | SortHeaderStyleOption
  | (() =>
      | ColumnStyle
      | BaseStyleOption
      | HeaderStdStyleOption
      | CheckHeaderStyleOption
      | MultilineTextHeaderStyleOption
      | SortHeaderStyleOption);

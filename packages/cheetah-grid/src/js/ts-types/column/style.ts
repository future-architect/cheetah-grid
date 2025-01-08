import type {
  ColumnIconOption,
  IndicatorDefine,
  IndicatorObject,
  LineClamp,
  TextOverflow,
  TreeBranchIconStyle,
  TreeLineStyle,
  Visibility,
} from "../define";
import type { ColorDef } from "../base";

export interface ColumnStyle {
  bgColor?: ColorDef;
  visibility?: Visibility;
  indicatorTopLeft?: IndicatorObject;
  indicatorTopRight?: IndicatorObject;
  indicatorBottomRight?: IndicatorObject;
  indicatorBottomLeft?: IndicatorObject;
  doChangeStyle(): void;
  clone(): ColumnStyle;
}

export interface BaseStyleOption {
  bgColor?: ColorDef;
  visibility?: Visibility;
  indicatorTopLeft?: IndicatorDefine;
  indicatorTopRight?: IndicatorDefine;
  indicatorBottomRight?: IndicatorDefine;
  indicatorBottomLeft?: IndicatorDefine;
}

export interface StdBaseStyleOption extends BaseStyleOption {
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  padding?: number | string | (number | string)[];
}
export interface StdTextBaseStyleOption extends StdBaseStyleOption {
  color?: ColorDef;
  font?: string;
  textOverflow?: TextOverflow;
}
export interface StdMultilineTextBaseStyleOption
  extends StdTextBaseStyleOption {
  lineHeight?: string | number;
  autoWrapText?: boolean;
  lineClamp?: LineClamp;
}

export type StyleOption = StdTextBaseStyleOption;
export interface HeaderStdStyleOption extends StdMultilineTextBaseStyleOption {
  multiline?: boolean;
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

export interface CheckHeaderStyleOption extends StdTextBaseStyleOption {
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

export type MultilineTextHeaderStyleOption = StdMultilineTextBaseStyleOption;

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
export interface TreeStyleOption extends StyleOption {
  lineStyle?: TreeLineStyle;
  lineColor?: ColorDef;
  lineWidth?: number;
  treeIcon?:
    | TreeBranchIconStyle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ColumnIconOption<any>;
}

export interface SortHeaderStyleOption extends MultilineTextHeaderStyleOption {
  sortArrowColor?: ColorDef;
  multiline?: boolean;
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

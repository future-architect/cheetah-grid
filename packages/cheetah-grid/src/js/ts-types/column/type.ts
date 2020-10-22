import type { ColumnMenuItemOptions } from "../define";

export interface BaseColumnOption {
  fadeinWhenCallbackInPromise?: boolean | null;
}
export interface NumberColumnOption extends BaseColumnOption {
  format?: Intl.NumberFormat;
}
export interface ButtonColumnOption extends BaseColumnOption {
  caption?: string;
}
export interface MenuColumnOption extends BaseColumnOption {
  options?: ColumnMenuItemOptions;
}

export interface IconColumnOption extends BaseColumnOption {
  tagName?: string;
  className?: string;
  content?: string;
  name?: string;
  iconWidth?: number;
}
export interface PercentCompleteBarColumnOption extends BaseColumnOption {
  min?: number;
  max?: number;
  formatter?: (value: string) => string;
}

export interface BranchGraphColumnOption extends BaseColumnOption {
  start?: "top" | "bottom";
  cache?: boolean;
}

export type SimpleBranchGraphCommand =
  | {
      command: "branch";
      branch:
        | string
        | {
            from: string;
            to: string;
          };
    }
  | {
      command: "commit";
      branch: string;
    }
  | {
      command: "merge";
      branch: {
        from: string;
        to: string;
      };
    }
  | {
      command: "tag";
      branch: string;
      tag: string;
    };
export type BranchGraphCommand =
  | SimpleBranchGraphCommand
  | undefined
  | null
  | SimpleBranchGraphCommand[];

export type ColumnTypeOption =
  | "DEFAULT"
  | "default"
  | "NUMBER"
  | "number"
  | "CHECK"
  | "check"
  | "BUTTON"
  | "button"
  | "IMAGE"
  | "image"
  | "MULTILINETEXT"
  | "multilinetext";

export type HeaderTypeOption =
  | "DEFAULT"
  | "default"
  | "SORT"
  | "sort"
  | "CHECK"
  | "check";

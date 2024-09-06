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
  formatter?: (value: unknown) => unknown;
}

export interface BranchGraphColumnOption extends BaseColumnOption {
  start?: "top" | "bottom";
  cache?: boolean;
}

/** Branches from the branch specified by `branch.from` to the branch specified by `branch.to`. */
export type BranchGraphCommandBranch = {
  command: "branch";
  branch:
    | string
    | {
        from: string;
        to: string;
      };
};
/** Commit the branch specified by `branch`. */
export type BranchGraphCommandCommit = {
  command: "commit";
  branch: string;
};
/** Merge the branch specified by `branch.from` into the branch specified by `branch.to`. */
export type BranchGraphCommandMerge = {
  command: "merge";
  branch: {
    from: string;
    to: string;
  };
};
/** Creates a tag specified by `tag` from the branch specified by `branch`. */
export type BranchGraphCommandTag = {
  command: "tag";
  branch: string;
  tag: string;
};
/** The value to supply to the BranchGraphColumn. */
export type BranchGraphCommand =
  | BranchGraphCommandBranch
  | BranchGraphCommandCommit
  | BranchGraphCommandMerge
  | BranchGraphCommandTag;

export type BranchGraphCommandValue =
  | BranchGraphCommand
  | undefined
  | null
  | BranchGraphCommand[];

/** The value to supply to the TreeColumn. */
export type TreeData = {
  /** The caption of the record */
  caption?: string;
  /** An array of path indicating the hierarchy */
  path: unknown[] | (() => unknown[]);

  nodeType?: "leaf" | "branch";
};

export type TreeDataValue = TreeData | unknown[] | undefined | null;

export interface TreeColumnOption extends BaseColumnOption {
  cache?: boolean;
}

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
  | "multilinetext"
  | "RADIO"
  | "radio";

export type HeaderTypeOption =
  | "DEFAULT"
  | "default"
  | "SORT"
  | "sort"
  | "CHECK"
  | "check";

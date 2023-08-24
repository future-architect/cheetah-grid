import type { ColorDef, MaybePromise } from "../ts-types/base";
export type SimpleColumnIconOption = {
  content?: string;
  font?: string;
  color?: ColorDef;
  className?: string;
  tagName?: string;
  isLiga?: boolean;
  width?: number;
  src?: MaybePromise<string>;
  svg?: string;
  name?: string;
  path?: string;
  offsetTop?: number;
  offsetLeft?: number;
};

import type { AnyFunction } from "../ts-types";
import { isNode } from "./utils";

const loads: { [key: string]: boolean } = {};
let load: (font: string, testStr: string, callback: AnyFunction) => void;
let check: (font: string, testStr: string) => boolean;
if (isNode) {
  load = function (
    _font: string,
    _testStr: string,
    callback: AnyFunction
  ): void {
    callback();
  };
  check = function (): boolean {
    return false;
  };
} else {
  const fontFaceSet = document.fonts;
  load = function (
    font: string,
    _testStr: string,
    callback: AnyFunction
  ): void {
    if (loads.all || loads[font]) {
      callback();
      return;
    }
    fontFaceSet.ready.then(() => {
      loads.all = true;
    });
    fontFaceSet.load(font).then(() => {
      loads[font] = true;
      callback();
    });
  };
  check = function (font: string, testStr: string): boolean {
    if (loads.all || loads[font]) {
      return true;
    }
    if (!fontFaceSet.check(font)) {
      load(font, testStr, () => {});
      return false;
    }
    return true;
  };
}

export { check, load };

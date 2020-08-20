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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fontFaceSet = (document as any).fonts;
  const legacy = !fontFaceSet;
  load = legacy
    ? function (font: string, testStr: string, callback: AnyFunction): void {
        //for legacy(IE)
        if (loads[`${font} @ ${testStr}`]) {
          callback();
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./legacy/fontwatch/FontWatchRunner").load(
          font,
          testStr,
          () => {
            loads[`${font} @ ${testStr}`] = true;
            callback();
          },
          () => {
            loads[`${font} @ ${testStr}`] = true;
            callback();
          }
        );
      }
    : function (font: string, _testStr: string, callback: AnyFunction): void {
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
  check = legacy
    ? function (font: string, testStr: string): boolean {
        //for legacy(IE)
        if (loads[`${font} @ ${testStr}`]) {
          return true;
        }
        load(font, testStr, () => {});
        return false;
      }
    : function (font: string, testStr: string): boolean {
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

import type { AnyFunction } from "../../../ts-types";
//see https://github.com/typekit/webfontloader

//http://defghi1977.html.xdomain.jp/tech/canvasMemo/canvasMemo.htm
import { FontRuler } from "./FontRuler";

const LastResortFonts: { [key: string]: string } = {
  SERIF: "serif",
  SANS_SERIF: "sans-serif",
};

const watchRunners: {
  [font: string]: { [testStr: string]: FontWatchRunner | undefined };
} = {};

class FontWatchRunner {
  activeCallbacks: AnyFunction[];
  inactiveCallbacks: AnyFunction[];
  status: "ok" | "ng" | null;
  lastResortWidths_: { [font: string]: number };
  fontRulerA_: FontRuler;
  fontRulerB_: FontRuler;
  started_: number;
  static load(
    font: string,
    testStr: string,
    activeCallback: AnyFunction,
    inactiveCallback: AnyFunction
  ): void {
    const c = watchRunners[font] || (watchRunners[font] = {});
    testStr += "";
    let runner: FontWatchRunner;
    if (c[testStr]) {
      runner = c[testStr]!;
    } else {
      runner = c[testStr] = new FontWatchRunner(font, testStr);
    }
    runner.then(activeCallback, inactiveCallback);
  }
  constructor(font: string, testStr: string) {
    this.activeCallbacks = [];
    this.inactiveCallbacks = [];
    this.status = null;
    this.lastResortWidths_ = {};

    this.fontRulerA_ = new FontRuler(
      `${font},${LastResortFonts.SERIF}`,
      testStr
    );
    this.fontRulerB_ = new FontRuler(
      `${font},${LastResortFonts.SANS_SERIF}`,
      testStr
    );
    const lastResortRulerA = new FontRuler(
      `4px ${LastResortFonts.SERIF}`,
      testStr
    );
    const lastResortRulerB = new FontRuler(
      `4px ${LastResortFonts.SANS_SERIF}`,
      testStr
    );

    //start
    this.lastResortWidths_[LastResortFonts.SERIF] = lastResortRulerA.getWidth();
    this.lastResortWidths_[LastResortFonts.SANS_SERIF] =
      lastResortRulerB.getWidth();

    lastResortRulerA.remove();
    lastResortRulerB.remove();

    this.started_ = Date.now();

    this.check_();
  }
  then(activeCallback: AnyFunction, inactiveCallback: AnyFunction): void {
    if (this.status) {
      if (this.status !== "ng") {
        activeCallback();
      } else {
        inactiveCallback();
      }
    } else {
      this.activeCallbacks.push(activeCallback);
      this.inactiveCallbacks.push(inactiveCallback);
    }
  }
  private check_(): void {
    const widthA = this.fontRulerA_.getWidth();
    const widthB = this.fontRulerB_.getWidth();

    if (
      this.isFallbackFont_(widthA, widthB) ||
      this.isLastResortFont_(widthA, widthB)
    ) {
      if (Date.now() - this.started_ >= 3000) {
        // timeout
        if (this.isLastResortFont_(widthA, widthB)) {
          this.finish_(this.activeCallbacks);
          this.status = "ok";
        } else {
          this.finish_(this.inactiveCallbacks);
          this.status = "ng";
        }
      } else {
        setTimeout(() => {
          this.check_();
        }, 50);
      }
    } else {
      this.finish_(this.activeCallbacks);
      this.status = "ok";
    }
  }
  isFallbackFont_(a: number, b: number): boolean {
    return (
      this.widthMatches_(a, LastResortFonts.SERIF) &&
      this.widthMatches_(b, LastResortFonts.SANS_SERIF)
    );
  }
  widthsMatchLastResortWidths_(a: number, b: number): boolean {
    for (const font in LastResortFonts) {
      if (LastResortFonts.hasOwnProperty(font)) {
        if (
          this.widthMatches_(a, LastResortFonts[font]) &&
          this.widthMatches_(b, LastResortFonts[font])
        ) {
          return true;
        }
      }
    }
    return false;
  }
  widthMatches_(width: number, lastResortFont: string): boolean {
    return width === this.lastResortWidths_[lastResortFont];
  }
  isLastResortFont_(a: number, b: number): boolean {
    return hasWebKitFallbackBug() && this.widthsMatchLastResortWidths_(a, b);
  }
  finish_(callbacks: AnyFunction[]): void {
    setTimeout(() => {
      this.fontRulerA_.remove();
      this.fontRulerB_.remove();
      callbacks.forEach((cb) => cb());
    }, 0);
  }
}

let HAS_WEBKIT_FALLBACK_BUG: boolean | null = null;
function hasWebKitFallbackBug(): boolean {
  if (HAS_WEBKIT_FALLBACK_BUG === null) {
    const match = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(
      window.navigator.userAgent
    );

    HAS_WEBKIT_FALLBACK_BUG =
      !!match &&
      (parseInt(match[1], 10) < 536 ||
        (parseInt(match[1], 10) === 536 && parseInt(match[2], 10) <= 11));
  }
  return HAS_WEBKIT_FALLBACK_BUG;
}

export = FontWatchRunner;

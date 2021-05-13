import { isNode } from "./utils";

function cubicBezier(
  x2: number,
  y2: number,
  x3: number,
  y3: number
): EasingFunction {
  let step: number;
  const err = 0.0001;

  x2 *= 3;
  y2 *= 3;
  x3 *= 3;
  y3 *= 3;

  return function (t: number): number {
    let p, a, b, c, d, x, s;
    if (t < 0 || 1 < t) {
      throw new Error(`${t}`);
    }

    p = step || t;

    do {
      a = 1 - p;
      b = a * a;
      c = p * p;
      d = c * p;

      x = x2 * b * p + x3 * a * c + d;
      s = t - x;
      p += s * 0.5;
    } while (err < Math.abs(s));

    step = p;
    return y2 * b * p + y3 * a * c + d;
  };
}

const EASINGS = {
  linear(p: number): number {
    return p;
  },
  easeIn: cubicBezier(0.42, 0.0, 1.0, 1.0),
  easeOut: cubicBezier(0.0, 0.0, 0.58, 1.0),
  easeInOut: cubicBezier(0.42, 0.0, 0.58, 1.0),
};

const raf: typeof requestAnimationFrame = (
  isNode
    ? (): void => {}
    : window.requestAnimationFrame ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((fn: () => void): any => setTimeout(fn, 1))
) as typeof requestAnimationFrame;

function now(): number {
  return Date.now();
}

export type EasingFunction = (t: number) => number;
export type EasingKind = keyof typeof EASINGS;
export type StepFunction = (s: number) => void;
/**
 * <pre>
 * Animates.
 * </pre>
 * @function
 * @param {number} duration animation time.
 * @param {function} step step
 * @param {function|string} easing easing
 * @returns {object} Deferred object.
 */
export function animate(
  duration: number,
  step: StepFunction,
  easing?: EasingKind | EasingFunction
): {
  cancel: () => void;
} {
  const startedAt = now();

  const easingFn: EasingFunction =
    easing == null
      ? EASINGS.easeInOut
      : typeof easing === "string"
      ? EASINGS[easing]
      : easing;

  let canceledFlg = false;
  const createAnim = (
    resolve: () => void,
    reject: () => void
  ): (() => void) => {
    const anim = (): void => {
      const point = now() - startedAt;
      if (canceledFlg) {
        //cancel
        if (reject) {
          reject();
        }
      } else if (point >= duration) {
        //end
        step(1);
        if (resolve) {
          resolve();
        }
      } else {
        step(easingFn(point / duration));

        raf(anim);
      }
    };
    return anim;
  };
  const cancel = (): void => {
    canceledFlg = true;
  };
  if (typeof Promise !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = new Promise<void>((resolve, reject) => {
      const anim = createAnim(resolve, reject);
      step(0);
      anim();
    });
    result.cancel = cancel;
    return result;
  } else {
    const anim = createAnim(
      () => {},
      () => {}
    );
    step(0);
    anim();
    return {
      cancel,
    };
  }
}

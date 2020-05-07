import type { AnyFunction } from "../ts-types";
import { EventHandler } from "./EventHandler";
import { isNode } from "./utils";
const handler = new EventHandler();

let ratio = 1;
function setRatio(): void {
  if (isNode) {
    ratio = 1;
  } else {
    ratio = Math.ceil(window.devicePixelRatio || 1);
    if (ratio > 1 && ratio % 2 !== 0) {
      ratio += 1;
    }
  }
}
setRatio();
if (!isNode) {
  handler.on(window, "resize", setRatio);
}

export function transform(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const { getAttribute, setAttribute } = canvas;
  canvas.getAttribute = function (name: string): string | null {
    let result = getAttribute.call(this, name);
    if (name === "width" || name === "height") {
      result = `${Number(result) / ratio}`;
    }
    return result;
  };
  canvas.setAttribute = function (name, val: string): void {
    const wh = name === "width" || name === "height";
    if (wh) {
      val = `${Number(val) * ratio}`;
    }
    const result = setAttribute.call(this, name, val);
    if (wh) {
      ctx.scale(ratio, ratio);
    }
    return result;
  };

  Object.defineProperty(canvas, "width", {
    get(): number {
      return Number(canvas.getAttribute("width"));
    },
    set: (val: number) => {
      canvas.setAttribute("width", `${Math.floor(val)}`);
    },
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(canvas, "height", {
    get(): number {
      return Number(canvas.getAttribute("height"));
    },
    set: (val: number) => {
      canvas.setAttribute("height", `${Math.floor(val)}`);
    },
    configurable: true,
    enumerable: true,
  });
  const { drawImage } = ctx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx.drawImage = function (img: CanvasImageSource, ...args: any[]): void {
    if (img !== canvas || ratio === 1) {
      return (drawImage as AnyFunction).call(this, img, ...args);
    }
    this.save();
    try {
      this.scale(1 / ratio, 1 / ratio);
      if (args.length > 4) {
        args[4] *= ratio;
        args[5] *= ratio;
      } else {
        args[0] *= ratio;
        args[1] *= ratio;
      }
      return (drawImage as AnyFunction).call(this, img, ...args);
    } finally {
      this.restore();
    }
  };

  return canvas;
}

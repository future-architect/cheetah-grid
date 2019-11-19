import { browser } from "./utils";

export function getPath2D(): typeof Path2D {
  if (typeof Path2D !== "undefined" && !browser.Edge) {
    return Path2D;
  }
  return require("./legacy/canvas/Path2DShim").Path2DShim;
}

export function fill(
  pathModule: {
    width: number;
    height: number;
    ud?: boolean;
    x?: number;
    y?: number;
    d: string;
    path2d?: Path2D;
  },
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  ctx.save();
  try {
    const { width, height } = pathModule;
    const { ud: upsideDown, x: offsetX = 0, y: offsetY = 0 } = pathModule;
    w = w || width;
    h = h || height;
    const xrate = w / width;
    const yrate = h / (upsideDown ? -height : height);
    x = x || 0;
    y = upsideDown ? (y || 0) + -height * yrate : y || 0;

    ctx.translate(x, y);
    ctx.scale(xrate, yrate);
    if (offsetX !== 0 || offsetY !== 0) {
      ctx.translate(offsetX, offsetY);
    }
    const Path2D = getPath2D();
    const path2d = (pathModule.path2d =
      pathModule.path2d || new Path2D(pathModule.d));
    ctx.fill(path2d);
  } finally {
    ctx.restore();
  }
}

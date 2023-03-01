import type { AnyFunction } from "../../../ts-types";
import type { CanvasOperations } from "./internal";
import { PathCommandsParser } from "./PathCommandsParser";

const parser = new PathCommandsParser();
type CanvasOperation = keyof CanvasOperations;

export class Path2DShim implements CanvasPath {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _ops: { op: CanvasOperation; args: any[] }[];
  arc(...args: Parameters<typeof Path2D.prototype.arc>): void {
    this._ops.push({ op: "arc", args });
  }
  arcTo(...args: Parameters<typeof Path2D.prototype.arcTo>): void {
    this._ops.push({ op: "arcTo", args });
  }
  bezierCurveTo(
    ...args: Parameters<typeof Path2D.prototype.bezierCurveTo>
  ): void {
    this._ops.push({ op: "bezierCurveTo", args });
  }
  closePath(...args: Parameters<typeof Path2D.prototype.closePath>): void {
    this._ops.push({ op: "closePath", args });
  }
  ellipse(...args: Parameters<typeof Path2D.prototype.ellipse>): void {
    this._ops.push({ op: "ellipse", args });
  }
  lineTo(...args: Parameters<typeof Path2D.prototype.lineTo>): void {
    this._ops.push({ op: "lineTo", args });
  }
  moveTo(...args: Parameters<typeof Path2D.prototype.moveTo>): void {
    this._ops.push({ op: "moveTo", args });
  }
  quadraticCurveTo(
    ...args: Parameters<typeof Path2D.prototype.quadraticCurveTo>
  ): void {
    this._ops.push({ op: "quadraticCurveTo", args });
  }
  rect(...args: Parameters<typeof Path2D.prototype.rect>): void {
    this._ops.push({ op: "rect", args });
  }
  constructor(arg: string | Path2DShim) {
    this._ops = [];
    if (arg === undefined) {
      return;
    }
    if (typeof arg === "string") {
      // try {
      this._ops = parser.parse(arg);
      // } catch (e) {
      // 	throw e;
      // }
    } else if (arg.hasOwnProperty("_ops")) {
      this._ops = [...arg._ops];
    } else {
      throw new Error(`Error: ${typeof arg} is not a valid argument to Path`);
    }
  }
  roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | DOMPointInit | (number | DOMPointInit)[] | undefined
  ): void;
  roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | DOMPointInit | Iterable<number | DOMPointInit> | undefined
  ): void;
  roundRect(
    _x: unknown,
    _y: unknown,
    _w: unknown,
    _h: unknown,
    _radii?: unknown
  ): void {
    throw new Error("Method not implemented.");
  }
}

const { CanvasRenderingContext2D } = window;

const originalFill: AnyFunction = CanvasRenderingContext2D.prototype.fill;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(CanvasRenderingContext2D.prototype as any).fill = function (
  ...args: Parameters<typeof CanvasRenderingContext2D.prototype.fill>
): void {
  if (args[0] instanceof Path2DShim) {
    const path = args[0];
    this.beginPath();
    path._ops.forEach((op) => {
      const fn: AnyFunction = this[op.op];
      fn.apply(this, op.args);
    });
    originalFill.apply(this, Array.prototype.slice.call(args, 1));
  } else {
    originalFill.apply(this, args);
  }
};

import type { CanvasOperations } from "./internal";

/*eslint new-cap: "off"*/

function mag(v: [number, number]): number {
  return Math.sqrt(v[0] ** 2 + v[1] ** 2);
}

function dot(u: [number, number], v: [number, number]): number {
  return u[0] * v[0] + u[1] * v[1];
}

function ratio(u: [number, number], v: [number, number]): number {
  return dot(u, v) / (mag(u) * mag(v));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function angle(u: [number, number], v: [number, number]): number {
  let sign = 1.0;
  if (u[0] * v[1] - u[1] * v[0] < 0) {
    sign = -1.0;
  }
  return sign * Math.acos(clamp(ratio(u, v), -1, 1));
}

function rotClockwise(v: [number, number], angle: number): [number, number] {
  const cost = Math.cos(angle);
  const sint = Math.sin(angle);
  return [cost * v[0] + sint * v[1], -1 * sint * v[0] + cost * v[1]];
}

function rotCounterClockwise(
  v: [number, number],
  angle: number
): [number, number] {
  const cost = Math.cos(angle);
  const sint = Math.sin(angle);
  return [cost * v[0] - sint * v[1], sint * v[0] + cost * v[1]];
}

function midPoint(u: [number, number], v: [number, number]): [number, number] {
  return [(u[0] - v[0]) / 2.0, (u[1] - v[1]) / 2.0];
}

function meanVec(u: [number, number], v: [number, number]): [number, number] {
  return [(u[0] + v[0]) / 2.0, (u[1] + v[1]) / 2.0];
}

function pointMul(u: [number, number], v: [number, number]): [number, number] {
  return [u[0] * v[0], u[1] * v[1]];
}

function scale(c: number, v: [number, number]): [number, number] {
  return [c * v[0], c * v[1]];
}

function sum(u: [number, number], v: [number, number]): [number, number] {
  return [u[0] + v[0], u[1] + v[1]];
}
// Convert an SVG elliptical arc to a series of canvas commands.
//
// x1, y1, x2, y2: start and stop coordinates of the ellipse.
// rx, ry: radii of the ellipse.
// phi: rotation of the ellipse.
// fA: large arc flag.
// fS: sweep flag.
function ellipseFromEllipticalArc(
  ctx: CanvasOperations,
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  phi: number,
  fA: number,
  fS: number,
  x2: number,
  y2: number
): void {
  // Convert from endpoint to center parametrization, as detailed in:
  //   http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
  if (rx === 0 || ry === 0) {
    ctx.lineTo(x2, x1);
    return;
  }
  phi *= Math.PI / 180.0;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const xPrime = rotClockwise(midPoint([x1, y1], [x2, y2]), phi); // F.6.5.1
  const xPrime2 = pointMul(xPrime, xPrime);
  let rx2 = rx ** 2;
  let ry2 = ry ** 2;

  const lambda = Math.sqrt(xPrime2[0] / rx2 + xPrime2[1] / ry2);
  if (lambda > 1) {
    rx *= lambda;
    ry *= lambda;
    rx2 = rx ** 2;
    ry2 = ry ** 2;
  }
  let factor = Math.sqrt(
    Math.abs(rx2 * ry2 - rx2 * xPrime2[1] - ry2 * xPrime2[0]) /
      (rx2 * xPrime2[1] + ry2 * xPrime2[0])
  );
  if (fA === fS) {
    factor *= -1.0;
  }
  const cPrime = scale(factor, [(rx * xPrime[1]) / ry, (-ry * xPrime[0]) / rx]); // F.6.5.2
  const c = sum(rotCounterClockwise(cPrime, phi), meanVec([x1, y1], [x2, y2])); // F.6.5.3
  const x1UnitVector: [number, number] = [
    (xPrime[0] - cPrime[0]) / rx,
    (xPrime[1] - cPrime[1]) / ry,
  ];
  const x2UnitVector: [number, number] = [
    (-1.0 * xPrime[0] - cPrime[0]) / rx,
    (-1.0 * xPrime[1] - cPrime[1]) / ry,
  ];
  const theta = angle([1, 0], x1UnitVector); // F.6.5.5
  const deltaTheta = angle(x1UnitVector, x2UnitVector); // F.6.5.6
  const start = theta;
  const end = theta + deltaTheta;
  ctx.save();
  ctx.translate(c[0], c[1]);
  ctx.rotate(phi);
  ctx.scale(rx, ry);
  ctx.arc(0, 0, 1, start, end, !fS);
  ctx.restore();
}

export class PathCommands {
  public readonly M: (px: number, py: number) => this;
  public readonly m: (px: number, py: number) => this;
  public readonly L: (px: number, py: number) => this;
  public readonly l: (px: number, py: number) => this;
  public readonly H: (px: number) => this;
  public readonly h: (px: number) => this;
  public readonly V: (py: number) => this;
  public readonly v: (py: number) => this;
  public readonly Z: () => this;
  public readonly z: () => this;
  public readonly C: (
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    px: number,
    py: number
  ) => this;
  public readonly c: (
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    px: number,
    py: number
  ) => this;
  public readonly S: (cpx: number, cpy: number, px: number, py: number) => this;
  public readonly s: (cpx: number, cpy: number, px: number, py: number) => this;
  public readonly Q: (cpx: number, cpy: number, px: number, py: number) => this;
  public readonly q: (cpx: number, cpy: number, px: number, py: number) => this;
  public readonly T: (px: number, py: number) => this;
  public readonly t: (px: number, py: number) => this;
  public readonly A: (
    rx: number,
    ry: number,
    xAxisRotation: number,
    largeArcFlag: number,
    sweepFlag: number,
    px: number,
    py: number
  ) => this;
  public readonly a: (
    rx: number,
    ry: number,
    xAxisRotation: number,
    largeArcFlag: number,
    sweepFlag: number,
    px: number,
    py: number
  ) => this;
  constructor(ctx: CanvasOperations) {
    let lMx: number;
    let lMy: number;
    let lx = 0;
    let ly = 0;
    let reflected: {
      x: number;
      y: number;
    };
    let lastCommand = "";
    function makeReflected(): {
      x: number;
      y: number;
    } {
      if ("CcSsQqTt".indexOf(lastCommand) < 0) {
        return { x: lx, y: ly };
      }
      return reflected;
    }

    this.M = (px, py): this => {
      ctx.moveTo(px, py);
      lMx = px;
      lMy = py;
      lx = px;
      ly = py;
      lastCommand = "M";
      return this;
    };
    this.m = (px, py): this => this.M(px + lx, py + ly);
    this.L = (px, py): this => {
      ctx.lineTo(px, py);
      lx = px;
      ly = py;
      lastCommand = "L";
      return this;
    };
    this.l = (px, py): this => this.L(px + lx, py + ly);
    this.H = (px): this => this.L(px, ly);
    this.h = (px): this => this.H(px + lx);
    this.V = (py): this => this.L(lx, py);
    this.v = (py): this => this.V(py + ly);
    this.Z = (): this => {
      ctx.closePath();
      lx = lMx;
      ly = lMy;
      lastCommand = "Z";
      return this;
    };
    this.z = (): this => this.Z();
    //C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
    this.C = (cp1x, cp1y, cp2x, cp2y, px, py): this => {
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, px, py);
      lx = px;
      ly = py;
      reflected = {
        x: 2 * px - cp2x,
        y: 2 * py - cp2y,
      };
      lastCommand = "C";
      return this;
    };
    this.c = (cp1x, cp1y, cp2x, cp2y, px, py): this =>
      this.C(cp1x + lx, cp1y + ly, cp2x + lx, cp2y + ly, px + lx, py + ly);
    //S x2 y2, x y (or s dx2 dy2, dx dy)
    this.S = (cpx, cpy, px, py): this => {
      const { x: cp1x, y: cp1y } = makeReflected(/*lastCommand*/);
      return this.C(cp1x, cp1y, cpx, cpy, px, py);
    };
    this.s = (cpx, cpy, px, py): this =>
      this.S(cpx + lx, cpy + ly, px + lx, py + ly);
    //Q x1 y1, x y (or q dx1 dy1, dx dy)
    this.Q = (cpx, cpy, px, py): this => {
      ctx.quadraticCurveTo(cpx, cpy, px, py);
      lx = px;
      ly = py;
      reflected = {
        x: 2 * px - cpx,
        y: 2 * py - cpy,
      };
      lastCommand = "Q";
      return this;
    };
    this.q = (cpx, cpy, px, py): this =>
      this.Q(cpx + lx, cpy + ly, px + lx, py + ly);
    //T x y (or t dx dy)
    this.T = (px, py): this => {
      const { x: cpx, y: cpy } = makeReflected();
      return this.Q(cpx, cpy, px, py);
    };
    this.t = (px, py): this => this.T(px + lx, py + ly);
    //A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    this.A = (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py): this => {
      const x1 = lx;
      const y1 = ly;

      ellipseFromEllipticalArc(
        ctx,
        x1,
        y1,
        rx,
        ry,
        xAxisRotation,
        largeArcFlag,
        sweepFlag,
        px,
        py
      );

      lx = px;
      ly = py;
      lastCommand = "A";
      return this;
    };
    //a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
    this.a = (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py): this =>
      this.A(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px + lx, py + ly);
  }
}

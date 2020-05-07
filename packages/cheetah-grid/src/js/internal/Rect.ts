import type { RectProps } from "../ts-types";

export class Rect implements RectProps {
  private _left: number;
  private _top: number;
  private _width: number;
  private _height: number;
  private _right: number | undefined;
  private _bottom: number | undefined;
  constructor(left: number, top: number, width: number, height: number) {
    this._left = left;
    this._top = top;
    this._width = width;
    this._height = height;
  }
  static bounds(
    left: number,
    top: number,
    right: number,
    bottom: number
  ): Rect {
    return new Rect(left, top, right - left, bottom - top);
  }
  static max(rect1: Rect, rect2: Rect): Rect {
    return Rect.bounds(
      Math.min(rect1.left, rect2.left),
      Math.min(rect1.top, rect2.top),
      Math.max(rect1.right, rect2.right),
      Math.max(rect1.bottom, rect2.bottom)
    );
  }
  get left(): number {
    return this._left;
  }
  set left(left: number) {
    const { right } = this;
    this._left = left;
    this.right = right;
  }
  get top(): number {
    return this._top;
  }
  set top(top: number) {
    const { bottom } = this;
    this._top = top;
    this.bottom = bottom;
  }
  get width(): number {
    return this._width;
  }
  set width(width: number) {
    this._width = width;
    this._right = undefined;
  }
  get height(): number {
    return this._height;
  }
  set height(height: number) {
    this._height = height;
    this._bottom = undefined;
  }
  get right(): number {
    return this._right !== undefined
      ? this._right
      : (this._right = this.left + this.width);
  }
  set right(right: number) {
    this._right = right;
    this.width = right - this.left;
  }
  get bottom(): number {
    return this._bottom !== undefined
      ? this._bottom
      : (this._bottom = this.top + this.height);
  }
  set bottom(bottom: number) {
    this._bottom = bottom;
    this.height = bottom - this.top;
  }
  offsetLeft(offset: number): void {
    this._left += offset;
    this._right = undefined;
  }
  offsetTop(offset: number): void {
    this._top += offset;
    this._bottom = undefined;
  }
  copy(): Rect {
    return new Rect(this.left, this.top, this.width, this.height);
  }
  intersection(rect: Rect): Rect | null {
    const x0 = Math.max(this.left, rect.left);
    const x1 = Math.min(this.left + this.width, rect.left + rect.width);
    if (x0 <= x1) {
      const y0 = Math.max(this.top, rect.top);
      const y1 = Math.min(this.top + this.height, rect.top + rect.height);
      if (y0 <= y1) {
        return Rect.bounds(x0, y0, x1, y1);
      }
    }
    return null;
  }
  contains(another: Rect): boolean {
    return (
      this.left <= another.left &&
      this.left + this.width >= another.left + another.width &&
      this.top <= another.top &&
      this.top + this.height >= another.top + another.height
    );
  }
  inPoint(x: number, y: number): boolean {
    return (
      this.left <= x &&
      this.left + this.width >= x &&
      this.top <= y &&
      this.top + this.height >= y
    );
  }
}

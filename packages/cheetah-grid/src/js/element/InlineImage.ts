import type { AnyFunction, MaybePromise } from "../ts-types";
import { Inline } from "./Inline";
import type { InlineDrawOption } from "./Inline";
import { getCacheOrLoad } from "../internal/imgs";
import { isPromise } from "../internal/utils";

export type InlineImageConstructorOption = {
  src: MaybePromise<string>;
  width?: number;
  height?: number;
  imageLeft?: number;
  imageTop?: number;
  imageWidth?: number;
  imageHeight?: number;
};

export class InlineImage extends Inline {
  private _src: MaybePromise<string>;
  private _width?: number;
  private _height?: number;
  private _imageLeft?: number;
  private _imageTop?: number;
  private _imageWidth?: number;
  private _imageHeight?: number;
  private _onloaded: AnyFunction[];
  private _inlineImgPromise: MaybePromise<HTMLImageElement> | null = null;
  private _inlineImg: HTMLImageElement | null = null;
  constructor({
    src,
    width,
    height,
    imageLeft,
    imageTop,
    imageWidth,
    imageHeight,
  }: InlineImageConstructorOption) {
    super();
    this._src = src;
    this._width = width;
    this._height = height;
    this._imageLeft = imageLeft;
    this._imageTop = imageTop;
    this._imageWidth = imageWidth;
    this._imageHeight = imageHeight;

    this._onloaded = [];

    if (isPromise(src)) {
      src.then((s) => {
        this._src = s;
        this._loadImage(s);
      });
    } else {
      this._loadImage(src);
    }
  }
  _loadImage(src: string): void {
    const img = (this._inlineImgPromise = getCacheOrLoad(
      "InlineImage",
      50,
      src
    ));
    if (isPromise(img)) {
      img.then((i) => {
        this._inlineImg = i;

        this._onloaded.forEach((fn) => fn());
      });
    } else {
      this._inlineImg = img;
    }
  }
  width(_arg: { ctx: CanvasRenderingContext2D }): number {
    return this._width || (this._inlineImg?.width ?? 0);
  }
  font(): string | null {
    return null;
  }
  color(): string | null {
    return null;
  }
  canDraw(): boolean {
    return !!this._inlineImg;
  }
  onReady(callback: AnyFunction): void {
    if (isPromise(this._src) || isPromise(this._inlineImgPromise)) {
      this._onloaded.push(() => callback());
    }
  }
  draw({
    ctx,
    canvashelper,
    rect,
    offset,
    offsetLeft,
    offsetRight,
    offsetTop,
    offsetBottom,
  }: InlineDrawOption): void {
    const img = this._inlineImg as HTMLImageElement;
    canvashelper.drawInlineImageRect(
      ctx,
      img,
      this._imageLeft || 0,
      this._imageTop || 0,
      this._imageWidth || img.width,
      this._imageHeight || img.height,
      this._width || img.width,
      this._height || img.height,
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      {
        offset: offset + 1,
        padding: {
          left: offsetLeft,
          right: offsetRight,
          top: offsetTop,
          bottom: offsetBottom,
        },
      }
    );
  }
  canBreak(): boolean {
    return false;
  }
  toString(): string {
    return "";
  }
}

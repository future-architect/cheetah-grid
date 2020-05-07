import { isPromise, then } from "../internal/utils";
import { InlineImage } from "./InlineImage";
import type { MaybePromise } from "../ts-types";

function buildSvgDataUrl(svg: string | Node): string {
  const data =
    typeof svg === "string" ? svg : new XMLSerializer().serializeToString(svg);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`; //svgデータをbase64に変換
  return url;
}
function getSvgElement(svg: string | SVGElement): SVGElement {
  if (typeof svg === "string") {
    const parser = new DOMParser();
    return parser.parseFromString(svg, "image/svg+xml")
      .children[0] as SVGElement;
  } else {
    return svg;
  }
}

export type InlineSvgConstructorOption = {
  svg: MaybePromise<string | SVGElement>;
  width?: number;
  height?: number;
};

export class InlineSvg extends InlineImage {
  constructor({ svg, width, height }: InlineSvgConstructorOption) {
    const svgElem = then(svg, getSvgElement);
    const elmWidth = !isPromise(svgElem)
      ? svgElem.getAttribute("width") ?? undefined
      : undefined;
    const elmHeight = !isPromise(svgElem)
      ? svgElem.getAttribute("height") ?? undefined
      : undefined;
    const numElmWidth = elmWidth != null ? Number(elmWidth) : undefined;
    const numElmHeight = elmHeight != null ? Number(elmHeight) : undefined;
    super({
      src: then(svg, buildSvgDataUrl),
      width: width || numElmWidth,
      height: height || numElmHeight,
      imageWidth: numElmWidth,
      imageHeight: numElmHeight,
    });
  }
  canBreak(): boolean {
    return false;
  }
  toString(): string {
    return "";
  }
}

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { get, isElementNode } from "./svg-data";
import type { SvgElement } from "./svg-data";

const nodeRequire = createRequire(import.meta.url);

interface GlyphOptions {
  "glyph-name"?: string | true;
  unicode?: string | true;
  resource?: string;
}

interface BuildScriptOptions {
  offsetX?: number;
  offsetY?: number;
  width: number;
  height: number;
  d: string;
  isGlyph?: boolean;
  html: string;
  resource: string;
}

function attr(el: SvgElement, name: string): string {
  return el.getAttribute(name) || "";
}

function polygonToPath(polygon: SvgElement): string {
  return `M${attr(polygon, "points")}z`;
}

function polylineToPath(polyline: SvgElement): string {
  return `M${attr(polyline, "points")}`;
}

function circleToPath(circle: SvgElement): string {
  const cx = Number(attr(circle, "cx"));
  const cy = Number(attr(circle, "cy"));
  const r = Number(attr(circle, "r"));
  const segments = 8;
  const angle = (2 * Math.PI) / segments;
  const anchorX = (theta: number): number => r * Math.cos(theta);
  const anchorY = (theta: number): number => r * Math.sin(theta);
  const controlX = (theta: number): number =>
    anchorX(theta) + r * Math.tan(angle / 2) * Math.cos(theta - Math.PI / 2);
  const controlY = (theta: number): number =>
    anchorY(theta) + r * Math.tan(angle / 2) * Math.sin(theta - Math.PI / 2);

  let paths = `M${cx + r} ${cy}`;
  for (let index = 1; index <= segments; index++) {
    const theta = index * angle;
    paths += `Q${controlX(theta) + cx} ${controlY(theta) + cy} ${
      anchorX(theta) + cx
    } ${anchorY(theta) + cy}`;
  }
  return paths;
}

function rectToPath(rect: SvgElement): string {
  const x = Number(attr(rect, "x"));
  const y = Number(attr(rect, "y"));
  const width = Number(attr(rect, "width"));
  const height = Number(attr(rect, "height"));
  return `M${x},${y} h${width} v${height} h${-width}z`;
}

function getD(path: SvgElement): string {
  if (path.getAttribute("fill") === "none") {
    return "";
  }
  return attr(path, "d").replace(/[\n\r]/gu, "");
}

function elementToPaths(el: SvgElement, resource: string): string {
  switch (el.tagName.toLowerCase()) {
    case "path":
    case "glyph":
      return getD(el);
    case "circle":
      return circleToPath(el);
    case "polygon":
      return polygonToPath(el);
    case "polyline":
      return polylineToPath(el);
    case "rect":
      return rectToPath(el);
    case "g": {
      let path = "";
      const { childNodes } = el;
      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        if (!isElementNode(child)) {
          continue;
        }
        if (!child.getAttribute("fill")) {
          child.setAttribute("fill", el.getAttribute("fill"));
        }
        path += elementToPaths(child, resource);
      }
      return path;
    }
    default:
      console.warn(
        `unsupported:${el.tagName}`,
        `@ ${resource}\n${el.innerHTML}`
      );
  }
  return "";
}

function buildScript({
  offsetX = 0,
  offsetY = 0,
  width,
  height,
  d,
  isGlyph,
  html,
  resource,
}: BuildScriptOptions): string {
  let flags = "";
  if (isGlyph) {
    flags += `ud: 1,
	`;
  }
  if (offsetX !== 0) {
    flags += `x: ${offsetX},
	`;
  }
  if (offsetY !== 0) {
    flags += `y: ${offsetY},
	`;
  }
  return `{
	/*
	original svg
	${html}
	@ ${resource}
	*/
	d: '${d}',
	width: ${width},
	height: ${height},
	${flags}
}`;
}

function glyphToJSON(
  svgString: string,
  {
    glyphName,
    unicode,
  }: { glyphName?: string | true; unicode?: string | true },
  resource: string
): string {
  const svg = get(svgString);
  const findGlyph = (): SvgElement | null => {
    if (glyphName && glyphName !== true) {
      return svg.findGlyph(glyphName);
    }
    return unicode && unicode !== true ? svg.findGlyphByUnicode(unicode) : null;
  };
  const emptyElement = { getAttribute: (): string => "" };
  const fontFace = svg.fontFaceElement || emptyElement;
  const font = svg.fontElement || emptyElement;
  const glyph = findGlyph();
  if (!glyph) {
    const glyphLabel =
      glyphName && glyphName !== true
        ? glyphName
        : unicode && unicode !== true
        ? unicode
        : "";
    throw new Error(`Glyph not found: ${glyphLabel}`);
  }

  const fontHorizAdvX = Number(font.getAttribute("horiz-adv-x")) || 0;
  const fontVertAdvX = Number(font.getAttribute("vert-adv-x")) || 0;
  const horizAdvX =
    Number(glyph.getAttribute("horiz-adv-x")) || fontHorizAdvX || 0;
  const vertAdvX =
    Number(glyph.getAttribute("vert-adv-x")) || fontVertAdvX || 0;

  const unitsPerEm = Number(fontFace.getAttribute("units-per-em")) || 1000;
  const descent = Number(fontFace.getAttribute("descent")) || vertAdvX;

  let size = unitsPerEm;
  const contentSize = {
    width: horizAdvX || unitsPerEm,
    height: vertAdvX || unitsPerEm,
  };
  if (horizAdvX > size) {
    size = horizAdvX;
  }
  if (vertAdvX > size) {
    size = vertAdvX;
  }

  let offsetX = 0;
  let offsetY = -descent;
  offsetX += Math.round((size - contentSize.width) / 2);
  offsetY += Math.round((size - contentSize.height) / 2);

  return buildScript({
    offsetX,
    offsetY,
    width: size,
    height: size,
    d: elementToPaths(glyph, resource),
    isGlyph: true,
    html: glyph.outerHTML,
    resource,
  });
}

function svgToJSON(svgString: string, resource: string): string {
  const { svg } = get(svgString);
  const viewBox = attr(svg, "viewBox").split(" ");
  const width = Number(attr(svg, "width") || viewBox[2]) || 0;
  const height = Number(attr(svg, "height") || viewBox[3]) || 0;
  const offsetX = 0 - Number(viewBox[0]) || 0;
  const offsetY = 0 - Number(viewBox[1]) || 0;

  let d = "";
  const { childNodes } = svg;
  for (let i = 0; i < childNodes.length; i++) {
    const el = childNodes[i];
    if (!isElementNode(el)) {
      continue;
    }
    d += elementToPaths(el, resource);
  }
  return buildScript({
    offsetX,
    offsetY,
    width,
    height,
    d,
    html: svgString,
    resource,
  });
}

function normalizeResource(resource: string): string {
  let index = resource.indexOf("\\node_modules\\");
  if (index === -1) {
    index = resource.indexOf("/node_modules/");
  }
  if (index >= 0) {
    return resource.slice(index + "/node_modules/".length);
  }
  return resource;
}

export function sourceToIconJsObject(
  svgCode: string,
  opt: GlyphOptions = {}
): string {
  const resource = normalizeResource(opt.resource || "");
  if (opt["glyph-name"] || opt.unicode) {
    return glyphToJSON(
      svgCode,
      {
        glyphName: opt["glyph-name"],
        unicode: opt.unicode,
      },
      resource
    );
  }
  return svgToJSON(svgCode, resource);
}

export function toIconJsObject(
  svgfile: string,
  opt: GlyphOptions = {}
): string {
  const svgCode = readFileSync(nodeRequire.resolve(svgfile), "utf-8");
  return sourceToIconJsObject(svgCode, {
    resource: svgfile,
    ...opt,
  });
}

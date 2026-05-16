import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { sourceToIconJsObject } from "./svg-to-icon";
import { get } from "./svg-data";
import type { SvgElement } from "./svg-data";

const nodeRequire = createRequire(import.meta.url);

interface FontSvgOptions {
  name?: string;
  resource?: string;
}

function toGlyphs(svgCode: string): SvgElement[] {
  const svg = get(svgCode);
  const glyphs: SvgElement[] = [];
  svg.walkAllGlyph((el) => glyphs.push(el));
  return glyphs;
}

function transform(
  glyphUnicode: string,
  svgCode: string,
  svgfile: string
): string {
  return sourceToIconJsObject(svgCode, {
    unicode: glyphUnicode,
    resource: svgfile,
  });
}

function charToHexCodeStr(char: string): string {
  if (/[!#-&(-[\]-_a-~]/u.test(char)) {
    return char;
  }
  return `\\u${`0000${char.charCodeAt(0).toString(16)}`.slice(-4)}`;
}

function toCodeString(code: string): string {
  let result = "";
  for (let i = 0; i < code.length; i++) {
    result += charToHexCodeStr(code[i]);
  }
  return result;
}

function buildObjectCode(
  svgCode: string,
  resource: string,
  { name = "unicode" }: FontSvgOptions = {}
): string {
  let script = "{\n";
  toGlyphs(svgCode).forEach((glyph) => {
    const unicode = glyph.getAttribute("unicode") || "";
    const targetName = glyph.getAttribute(name) || "";
    script += `
	'${toCodeString(targetName)}': ${transform(unicode, svgCode, resource).replace(
      /\r?\n|\r/gu,
      `
	`
    )},`;
  });
  script += "\n}";
  return script;
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

export function sourceToIconsJsObject(
  svgCode: string,
  opt: FontSvgOptions = {}
): string {
  return buildObjectCode(svgCode, normalizeResource(opt.resource || ""), opt);
}

export function toIconsJsObject(
  svgfile: string,
  opt: FontSvgOptions = {}
): string {
  const svgCode = readFileSync(nodeRequire.resolve(svgfile), "utf-8");
  return sourceToIconsJsObject(svgCode, {
    resource: svgfile,
    ...opt,
  });
}

import { DOMParser as XmldomDOMParser } from "@xmldom/xmldom";

const ELEMENT_NODE = 1;

export interface SvgElement {
  nodeType: number;
  tagName: string;
  childNodes: ArrayLike<SvgNode>;
  innerHTML: string;
  outerHTML: string;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string | null): void;
}

export interface SvgNode {
  nodeType: number;
  tagName?: string;
  childNodes?: ArrayLike<SvgNode>;
}

type TestElement = (el: SvgElement) => boolean;

const DOMParserImpl =
  typeof window !== "undefined" && window.DOMParser
    ? window.DOMParser
    : XmldomDOMParser;
const parser = new DOMParserImpl();

function isElementNode(node: SvgNode): node is SvgElement {
  return node.nodeType === ELEMENT_NODE && typeof node.tagName === "string";
}

function findElement(el: SvgElement, test: TestElement): SvgElement | null {
  const { childNodes } = el;
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    if (!isElementNode(child)) {
      continue;
    }
    if (test(child)) {
      return child;
    }
    const result = findElement(child, test);
    if (result) {
      return result;
    }
  }
  return null;
}

export class Svg {
  readonly svg: SvgElement;
  private readonly glyphs: Record<string, SvgElement | null | undefined> = {};
  private readonly glyphUnicodes: Record<
    string,
    SvgElement | null | undefined
  > = {};
  private cachedFontFaceElement: SvgElement | null | undefined;
  private cachedFontElement: SvgElement | null | undefined;
  constructor(svgCode: string) {
    const document = parser.parseFromString(svgCode, "image/svg+xml");
    this.svg = document.documentElement as unknown as SvgElement;
  }
  findElement(test: TestElement): SvgElement | null {
    return findElement(this.svg, test);
  }
  get fontFaceElement(): SvgElement | null {
    if (this.cachedFontFaceElement === undefined) {
      this.cachedFontFaceElement = this.findElement(
        (child) => child.tagName.toLowerCase() === "font-face"
      );
    }
    return this.cachedFontFaceElement;
  }
  get fontElement(): SvgElement | null {
    if (this.cachedFontElement === undefined) {
      this.cachedFontElement = this.findElement(
        (child) => child.tagName.toLowerCase() === "font"
      );
    }
    return this.cachedFontElement;
  }
  findGlyph(glyphName: string): SvgElement | null {
    if (!(glyphName in this.glyphs)) {
      this.glyphs[glyphName] = this.findElement(
        (child) => child.getAttribute("glyph-name") === glyphName
      );
    }
    return this.glyphs[glyphName] || null;
  }
  findGlyphByUnicode(unicode: string): SvgElement | null {
    if (!(unicode in this.glyphUnicodes)) {
      this.glyphUnicodes[unicode] = this.findElement(
        (child) => child.getAttribute("unicode") === unicode
      );
    }
    return this.glyphUnicodes[unicode] || null;
  }
  walkAllGlyph(callback: (el: SvgElement) => void): void {
    const walkGlyph = (el: SvgElement): void => {
      const { childNodes } = el;
      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        if (!isElementNode(child)) {
          continue;
        }
        const unicode = child.getAttribute("unicode");
        if (unicode && child.getAttribute("d")) {
          if (!this.glyphUnicodes[unicode]) {
            this.glyphUnicodes[unicode] = child;
          }
          const glyphName = child.getAttribute("glyph-name");
          if (glyphName && !this.glyphs[glyphName]) {
            this.glyphs[glyphName] = child;
          }
          callback(child);
        } else {
          walkGlyph(child);
        }
      }
    };
    walkGlyph(this.svg);
  }
}

const cache: Record<string, Svg | undefined> = {};

export function get(svgCode: string): Svg {
  const cacheKey = `font:${svgCode}`;
  cache[cacheKey] = cache[cacheKey] || new Svg(svgCode);
  return cache[cacheKey]!;
}

export { isElementNode };

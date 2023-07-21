export type RGBA = { r: number; g: number; b: number; a: number };
const rgbMap: { [key: string]: RGBA } = {};
function styleColorToRGB(color: string): RGBA | null {
  const dummy = document.createElement("div");
  const { style } = dummy;
  style.color = color;
  style.position = "fixed";
  style.height = "1px";
  style.width = "1px";
  style.opacity = "0";
  document.body.appendChild(dummy);
  const { color: styleColor } = (
    document.defaultView || window
  ).getComputedStyle(dummy, "");
  document.body.removeChild(dummy);
  return colorToRGB0(styleColor || "");
}

function hexToNum(hex: string): number {
  return parseInt(hex, 16);
}

function createRGB(r: number, g: number, b: number, a = 1): RGBA {
  return { r, g, b, a };
}
function tripleHexToRGB({ 1: r, 2: g, 3: b }: string): RGBA {
  return createRGB(hexToNum(r + r), hexToNum(g + g), hexToNum(b + b));
}
function sextupleHexToRGB({
  1: r1,
  2: r2,
  3: g1,
  4: g2,
  5: b1,
  6: b2,
}: string): RGBA {
  return createRGB(hexToNum(r1 + r2), hexToNum(g1 + g2), hexToNum(b1 + b2));
}

function testRGB({ r, g, b, a }: RGBA): boolean {
  return (
    0 <= r &&
    r <= 255 &&
    0 <= g &&
    g <= 255 &&
    0 <= b &&
    b <= 255 &&
    0 <= a &&
    a <= 1
  );
}
function rateToByte(r: number): number {
  return Math.ceil((r * 255) / 100);
}
const numberPattern = /((?:\+|-)?(?:\d+(?:\.\d+)?|\.\d+))/.source;
const percentPattern = `${numberPattern}%`;
const maybePercentPattern = `${numberPattern}(%?)`;
function buildRgbWithCommaRegExp(bytePattern: string) {
  return new RegExp(
    `^rgba?\\(\\s*${bytePattern}\\s*,\\s*${bytePattern}\\s*,\\s*${bytePattern}\\s*\\)$`,
    "i"
  );
}
function buildRgbLv4RegExp(bytePattern: string) {
  return new RegExp(
    `^rgba?\\(\\s*${bytePattern}\\s+${bytePattern}\\s+${bytePattern}\\s*\\)$`,
    "i"
  );
}
function buildRgbaWithCommaRegExp(bytePattern: string, alphaPattern: string) {
  return new RegExp(
    `^rgba?\\(\\s*${bytePattern}\\s*,\\s*${bytePattern}\\s*,\\s*${bytePattern}\\s*,\\s*${alphaPattern}\\s*\\)$`,
    "i"
  );
}
function buildRgbaLv4RegExp(bytePattern: string, alphaPattern: string) {
  return new RegExp(
    `^rgba?\\(\\s*${bytePattern}\\s+${bytePattern}\\s+${bytePattern}\\s*/\\s*${alphaPattern}\\s*\\)$`,
    "i"
  );
}
function colorToRGB0(color: string): RGBA | null {
  if (/^#[0-9a-f]{3}$/i.exec(color)) {
    return tripleHexToRGB(color);
  }
  if (/^#[0-9a-f]{6}$/i.exec(color)) {
    return sextupleHexToRGB(color);
  }
  let ret =
    buildRgbWithCommaRegExp(numberPattern).exec(color) ||
    buildRgbLv4RegExp(numberPattern).exec(color);
  if (ret) {
    const rgb = createRGB(Number(ret[1]), Number(ret[2]), Number(ret[3]));
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  ret =
    buildRgbWithCommaRegExp(percentPattern).exec(color) ||
    buildRgbLv4RegExp(percentPattern).exec(color);
  if (ret) {
    const rgb = createRGB(
      rateToByte(Number(ret[1])),
      rateToByte(Number(ret[2])),
      rateToByte(Number(ret[3]))
    );
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  ret =
    buildRgbaWithCommaRegExp(numberPattern, maybePercentPattern).exec(color) ||
    buildRgbaLv4RegExp(numberPattern, maybePercentPattern).exec(color);
  if (ret) {
    const rgb = createRGB(
      Number(ret[1]),
      Number(ret[2]),
      Number(ret[3]),
      Number(ret[4]) / (ret[5] /* % */ ? 100 : 1)
    );
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  ret =
    buildRgbaWithCommaRegExp(percentPattern, maybePercentPattern).exec(color) ||
    buildRgbaLv4RegExp(percentPattern, maybePercentPattern).exec(color);
  if (ret) {
    const rgb = createRGB(
      rateToByte(Number(ret[1])),
      rateToByte(Number(ret[2])),
      rateToByte(Number(ret[3])),
      Number(ret[4]) / (ret[5] /* % */ ? 100 : 1)
    );
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  return null;
}
export function colorToRGB(color: string): RGBA {
  if (typeof color !== "string") {
    return createRGB(0, 0, 0, 0);
  }
  color = color.toLowerCase().trim();
  if (rgbMap[color]) {
    return rgbMap[color];
  }
  return colorToRGB0(color) || (rgbMap[color] = styleColorToRGB(color) as RGBA);
}

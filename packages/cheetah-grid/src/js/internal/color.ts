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
function colorToRGB0(color: string): RGBA | null {
  if (/^#[0-9a-f]{3}$/i.exec(color)) {
    return tripleHexToRGB(color);
  }
  if (/^#[0-9a-f]{6}$/i.exec(color)) {
    return sextupleHexToRGB(color);
  }
  let ret = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(
    color
  );
  if (ret) {
    const rgb = createRGB(Number(ret[1]), Number(ret[2]), Number(ret[3]));
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  ret =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d(\.\d)?)\s*\)$/i.exec(
      color
    );
  if (ret) {
    const rgb = createRGB(
      Number(ret[1]),
      Number(ret[2]),
      Number(ret[3]),
      Number(ret[4])
    );
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  ret =
    /^rgb\(\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*\)$/i.exec(
      color
    );
  if (ret) {
    const rgb = createRGB(
      rateToByte(Number(ret[1])),
      rateToByte(Number(ret[3])),
      rateToByte(Number(ret[5]))
    );
    if (testRGB(rgb)) {
      return rgb;
    }
  }
  ret =
    /^rgba\(\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d(\.\d)?)\s*\)$/i.exec(
      color
    );
  if (ret) {
    const rgb = createRGB(
      rateToByte(Number(ret[1])),
      rateToByte(Number(ret[3])),
      rateToByte(Number(ret[5])),
      Number(ret[7])
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

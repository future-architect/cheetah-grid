//see https://github.com/typekit/webfontloader

type Styles1 = {
  display: "block";
  position: "absolute";
  top: "-9999px";
  left: "-9999px";
  width: "auto";
  height: "auto";
  margin: "0";
  padding: "0";
  "white-space": "nowrap";
  font: string;
};
type Styles2 = {
  "font-variant": "normal";
  "font-size": "300px";
  "font-style": "normal";
  "font-weight": "400";
  "line-height": "normal";
};

type StyleKeys = keyof Styles1 | keyof Styles2;

function computeStyle(font: string): [Styles1, Styles2] {
  return [
    {
      display: "block",
      position: "absolute",
      top: "-9999px",
      left: "-9999px",
      width: "auto",
      height: "auto",
      margin: "0",
      padding: "0",
      "white-space": "nowrap",
      font,
    },
    {
      "font-variant": "normal",
      "font-size": "300px",
      "font-style": "normal",
      "font-weight": "400",
      "line-height": "normal",
    },
  ];
}

export class FontRuler {
  private el_: HTMLSpanElement;
  constructor(font: string, testStr: string) {
    const e = document.createElement("span");
    e.setAttribute("aria-hidden", "true");
    e.textContent = testStr || "BESbswy";

    computeStyle(font).forEach((style: Styles1 | Styles2) => {
      for (const k in style) {
        const key = k as StyleKeys;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e.style[key as any] = (style as any)[key];
      }
    });
    document.body.appendChild(e);
    this.el_ = e;
  }
  getWidth(): number {
    return this.el_.offsetWidth;
  }
  remove(): void {
    document.body.removeChild(this.el_);
  }
}

import assert from "node:assert";

import plugin from "../../src";
import {
  buildParams,
  shouldTransform,
  transformSvg,
} from "../../src/core/transform";

function evaluateDefaultExport(code: string): unknown {
  // eslint-disable-next-line no-eval
  return eval(
    `(${code.replace(/^export default\s*/u, "").replace(/;\s*$/u, "")})`
  );
}

describe("unplugin-cheetah-grid-icon-svg", () => {
  it("should expose unplugin adapters", () => {
    assert.strictEqual(typeof plugin.vite, "function");
    assert.strictEqual(typeof plugin.rollup, "function");
    assert.strictEqual(typeof plugin.rolldown, "function");
    assert.strictEqual(typeof plugin.webpack, "function");
    assert.strictEqual(typeof plugin.esbuild, "function");
  });

  it("should detect SVG imports by query or include option", () => {
    assert.strictEqual(shouldTransform("/icons/add.svg"), false);
    assert.strictEqual(
      shouldTransform("/icons/add.svg?cheetah-grid-icon"),
      true
    );
    assert.strictEqual(shouldTransform("/icons/add.svg?cg-icon"), true);
    assert.strictEqual(
      shouldTransform("/icons/add.svg", { include: /\/icons\//u }),
      true
    );
    assert.strictEqual(
      shouldTransform("/icons/add.svg", {
        include: /\/icons\//u,
        exclude: "add.svg",
      }),
      false
    );
    assert.strictEqual(
      shouldTransform("/icons/add.png?cheetah-grid-icon"),
      false
    );
  });

  it("should remove only plugin query names from transform params", () => {
    assert.deepStrictEqual(
      buildParams(
        "/icons/font.svg?cheetah-grid-icon&glyph-name=add&name=glyph-name"
      ),
      {
        "glyph-name": "add",
        name: "glyph-name",
        resource: "/icons/font.svg",
      }
    );
  });

  it("should transform a normal SVG into a Cheetah Grid icon module", () => {
    const svg = '<svg viewBox="0 0 24 24"><path d="M1 2h3z"/></svg>';
    const result = evaluateDefaultExport(
      transformSvg(svg, "/icons/add.svg?cheetah-grid-icon").code
    );

    assert.deepStrictEqual(result, {
      d: "M1 2h3z",
      width: 24,
      height: 24,
    });
  });

  it("should transform a font SVG into a Cheetah Grid icons module", () => {
    const svg = [
      '<svg><defs><font horiz-adv-x="1000">',
      '<font-face units-per-em="1000" descent="-150"/>',
      '<glyph glyph-name="add" unicode="A" d="M1 2h3z"/>',
      "</font></defs></svg>",
    ].join("");
    const result = evaluateDefaultExport(
      transformSvg(svg, "/icons/font.svg?cheetah-grid-icon").code
    );

    assert.deepStrictEqual(result, {
      A: {
        d: "M1 2h3z",
        width: 1000,
        height: 1000,
        ud: 1,
        y: 150,
      },
    });
  });

  it("should transform a single glyph from a font SVG", () => {
    const svg = [
      '<svg><defs><font horiz-adv-x="1000">',
      '<font-face units-per-em="1000" descent="-150"/>',
      '<glyph glyph-name="add" unicode="A" d="M1 2h3z"/>',
      "</font></defs></svg>",
    ].join("");
    const result = evaluateDefaultExport(
      transformSvg(svg, "/icons/font.svg?cheetah-grid-icon&glyph-name=add").code
    );

    assert.deepStrictEqual(result, {
      d: "M1 2h3z",
      width: 1000,
      height: 1000,
      ud: 1,
      y: 150,
    });
  });
});

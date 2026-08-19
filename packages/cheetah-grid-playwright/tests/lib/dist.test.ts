import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";
import type { gridLocator as gridLocatorSrc } from "../../src/index";
import { gotoFixture } from "../support/goto-fixture";

const FIXTURE_URL = new URL("../fixtures/grid.html", import.meta.url).href;
const DIST_URL = new URL("../../dist/index.js", import.meta.url).href;

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch({ channel: "chrome" });
  page = await browser.newPage();
});

afterAll(async () => {
  await browser?.close();
});

/**
 * Smoke test of the BUILT package. The page function is serialized with
 * Function.prototype.toString at runtime, so a build configuration change
 * (minification, helper injection, downleveling) can break the shipped
 * artifact while all the src-based tests stay green.
 */
describe("built package", () => {
  it("drives the grid through the built module", async () => {
    if (!existsSync(fileURLToPath(DIST_URL))) {
      throw new Error("dist/index.js not found. Run `pnpm run build` first.");
    }
    // The specifier is a variable so that type checking does not depend
    // on the build output; the types come from the source instead.
    const { gridLocator } = (await import(DIST_URL)) as {
      gridLocator: typeof gridLocatorSrc;
    };

    await gotoFixture(page, FIXTURE_URL);
    const grid = gridLocator(page.locator(".cheetah-grid"));
    expect(await grid.cell("fname", 0).value()).toBe("name0");
    // Exercise the scroll wait and the editor flow through the built code.
    await grid.cell("email", 800).fill("dist@example.com");
    expect(await grid.cell("email", 800).value()).toBe("dist@example.com");
  });
});

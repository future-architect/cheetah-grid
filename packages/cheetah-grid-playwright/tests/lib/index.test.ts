import type { Browser, Page } from "playwright";
import { chromium } from "playwright";
import { gridLocator } from "../../src/index";

const FIXTURE_URL = new URL("../fixtures/grid.html", import.meta.url).href;

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch({ channel: "chrome" });
  page = await browser.newPage();
});

afterAll(async () => {
  await browser?.close();
});

beforeEach(async () => {
  await page.goto(FIXTURE_URL);
  await page.waitForFunction(() => (window as { grid?: unknown }).grid != null);
});

describe("gridLocator", () => {
  it("reads cell values by field and record index", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    expect(await grid.cell("fname", 0).value()).toBe("name0");
    expect(await grid.cell("email", 2).value()).toBe("mail2@example.com");
  });

  it("reads header captions by raw cell indices", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    expect(await grid.cellAt(2, 0).value()).toBe("First Name");
  });

  it("resolves the grid from an ancestor element", async () => {
    const grid = gridLocator(page.locator("#parent"));
    expect(await grid.cell("fname", 1).value()).toBe("name1");
  });

  it("selects a cell by clicking it", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("email", 2).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 3, row: 3 });
  });

  it("replaces the value of an editable cell", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("fname", 1).fill("Replaced");
    expect(await grid.cell("fname", 1).value()).toBe("Replaced");
  });

  it("replaces the value of a cell outside the viewport", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("email", 800).fill("far@example.com");
    expect(await grid.cell("email", 800).value()).toBe("far@example.com");
  });

  it("opens the editor with a double click", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("fname", 3).dblclick();
    // The editor ignores Enter for one macrotask after opening.
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve);
        })
    );
    await page.locator("input:focus").fill("DblEdited");
    await page.keyboard.press("Enter");
    expect(await grid.cell("fname", 3).value()).toBe("DblEdited");
  });

  it("toggles a check cell by clicking it", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    expect(await grid.cell("check", 0).value()).toBe(true);
    await grid.cell("check", 0).click();
    expect(await grid.cell("check", 0).value()).toBe(false);
  });

  it("throws a clear error for an unknown field", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("unknown", 0).value()).rejects.toThrow(
      "Cell not found: field=unknown, index=0"
    );
  });
});

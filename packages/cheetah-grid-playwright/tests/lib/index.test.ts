import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";
import { gridLocator } from "../../src/index";
import { gotoFixture } from "../support/goto-fixture";

const FIXTURE_URL = new URL("../fixtures/grid.html", import.meta.url).href;
// Iframe tests require real origins (file: documents are opaque origins in
// Chrome, so even same-directory iframes read as cross-origin), so the
// fixtures are also served over HTTP from the repository root.
const REPO_ROOT = fileURLToPath(new URL("../../../..", import.meta.url));
const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};

let browser: Browser;
let page: Page;
let pageErrors: Error[] = [];
let server: Server;
let serverUrl: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const path = normalize(join(REPO_ROOT, req.url?.split("?")[0] ?? "/"));
    if (!path.startsWith(REPO_ROOT)) {
      res.statusCode = 403;
      res.end();
      return;
    }
    readFile(path).then(
      (body) => {
        res.setHeader(
          "Content-Type",
          CONTENT_TYPES[extname(path)] ?? "application/octet-stream"
        );
        res.end(body);
      },
      () => {
        res.statusCode = 404;
        res.end();
      }
    );
  });
  // Loopback only: the default bind would expose the repository files
  // to the local network while the suite runs.
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  serverUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  browser = await chromium.launch({ channel: "chrome" });
  page = await browser.newPage();
  page.on("pageerror", (error) => pageErrors.push(error));
});

afterAll(async () => {
  await browser?.close();
  await new Promise((resolve) => {
    server?.close(resolve);
  });
});

beforeEach(async () => {
  await gotoFixture(page, FIXTURE_URL);
  pageErrors = [];
});

afterEach(async () => {
  // Let pending requestAnimationFrame callbacks fire before checking.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      })
  );
  expect(pageErrors).toEqual([]);
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

  it("operates on a grid inside a same-origin iframe", async () => {
    await page.goto(
      `${serverUrl}/packages/cheetah-grid-playwright/tests/fixtures/iframe-grid.html`
    );
    const gridElement = page.frameLocator("iframe").locator(".cheetah-grid");
    await gridElement.waitFor();
    const grid = gridLocator(gridElement);
    await grid.cell("email", 2).click();
    const select = await gridElement.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 3, row: 3 });
    await grid.cell("fname", 1).fill("InIframe");
    expect(await grid.cell("fname", 1).value()).toBe("InIframe");
  });

  it("replaces the value of a lazily loaded record", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/async-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("name", 300).fill("LazyFilled");
    expect(await grid.cell("name", 300).value()).toBe("LazyFilled");
  });

  it("fails clearly when the cell editor does not open", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("personid", 0).fill("x")).rejects.toThrow(
      "The cell editor did not open"
    );
  });

  it("returns the whole rectangle of a merged cell", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/layout-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    const merged = await grid.cell("name", 0).rect();
    const single = await grid.cell("note1", 0).rect();
    expect(merged.height).toBe(single.height * 2);
    await grid.cell("name", 0).fill("MergedFilled");
    expect(await grid.cell("name", 0).value()).toBe("MergedFilled");
  });

  it("rejects operating on a grid scaled by an ancestor transform", async () => {
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#parent")!.style.transform =
        "scale(0.8)";
    });
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("fname", 0).rect()).rejects.toThrow(
      "scaled by an ancestor transform"
    );
  });

  it("operates on a grid below the window fold", async () => {
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.style.height = "2000px";
      document.body.prepend(spacer);
    });
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("fname", 1).fill("BelowFold");
    expect(await grid.cell("fname", 1).value()).toBe("BelowFold");
  });

  it("operates under scroll-behavior: smooth", async () => {
    await page.addStyleTag({
      content: "* { scroll-behavior: smooth !important; }",
    });
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("email", 800).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 3, row: 801 });
  });

  it("operates on a grid taller than the window viewport", async () => {
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#parent")!.style.height = "2000px";
    });
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLElement>(".cheetah-grid canvas")!
          .offsetHeight > 1500
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("email", 800).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 3, row: 801 });
  });

  it("rejects fill() on a menu editor cell and closes the menu", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/editors-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("lang", 0).fill("ja")).rejects.toThrow(
      "The cell editor did not open"
    );
    expect(
      await page.locator(".cheetah-grid__inline-menu--shown").count()
    ).toBe(0);
    // Subsequent operations are not affected by the failed fill().
    await grid.cell("name", 0).fill("AfterMenu");
    expect(await grid.cell("name", 0).value()).toBe("AfterMenu");
  });

  it("rejects fill() when the input validator rejects the value", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/editors-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("age", 1).fill("abc")).rejects.toThrow(
      "The cell value was not committed: Please enter numbers only."
    );
    expect(await grid.cell("age", 1).value()).toBe(21);
    expect(
      await page.locator(".cheetah-grid__small-dialog-input--shown").count()
    ).toBe(0);
    // A valid value still commits.
    await grid.cell("age", 1).fill("42");
    expect(await grid.cell("age", 1).value()).toBe("42");
  });

  it("throws a clear error for an out-of-range cell", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("email", 5000).value()).rejects.toThrow(
      "Cell out of range: field=email, index=5000"
    );
    await expect(grid.cellAt(99, 0).rect()).rejects.toThrow(
      "Cell out of range: col=99, row=0"
    );
    // A negative index would resolve onto a header row, and a fractional
    // one onto a nonexistent row; both are rejected at the API boundary.
    expect(() => grid.cell("email", -1)).toThrow(
      "The record index must be a non-negative integer: -1"
    );
    expect(() => grid.cell("email", 0.5)).toThrow(
      "The record index must be a non-negative integer: 0.5"
    );
    expect(() => grid.cellAt(1.5, 2)).toThrow(
      "The column and row indices must be integers: col=1.5, row=2"
    );
  });

  it("operates on a merged cell spanning the frozen column boundary", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/frozen-span-grid.html", import.meta.url).href
    );
    // Scroll fully to the right so that the scrollable half of the
    // merged cell moves under the frozen half.
    await page.evaluate(async () => {
      const { grid } = window as unknown as {
        grid: {
          scrollLeft: number;
          listen: (type: string, fn: () => void) => number;
          unlisten: (id: number) => void;
        };
      };
      const scrolled = new Promise<void>((resolve) => {
        const id = grid.listen("scroll", () => {
          grid.unlisten(id);
          resolve();
        });
      });
      grid.scrollLeft = 800;
      await scrolled;
    });
    const grid = gridLocator(page.locator(".cheetah-grid"));
    const rect = await grid.cell("name", 5).rect();
    expect(rect.width).toBeGreaterThan(0);
    await grid.cell("name", 5).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select.row).toBe(6);
    expect(await grid.cell("name", 5).value()).toBe("name5");
  });

  it("operates on a cell wider than the grid viewport", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/wide-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("wide", 0).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 1, row: 1 });
    await grid.cell("wide", 1).fill("WideFilled");
    expect(await grid.cell("wide", 1).value()).toBe("WideFilled");
  });

  it("scrolls an ancestor scroll container to the cell", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/clip-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("name", 12).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 1, row: 13 });
    await grid.cell("name", 15).fill("Clipped");
    expect(await grid.cell("name", 15).value()).toBe("Clipped");
  });

  it("scrolls the grid's iframe to the cell", async () => {
    await page.goto(
      `${serverUrl}/packages/cheetah-grid-playwright/tests/fixtures/short-iframe-grid.html`
    );
    const gridElement = page.frameLocator("iframe").locator(".cheetah-grid");
    await gridElement.waitFor();
    const grid = gridLocator(gridElement);
    await grid.cell("name", 25).click();
    const select = await gridElement.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 1, row: 26 });
  });

  it("rejects a grid inside a transform-scaled iframe", async () => {
    await page.goto(
      `${serverUrl}/packages/cheetah-grid-playwright/tests/fixtures/scaled-iframe-grid.html`
    );
    const gridElement = page.frameLocator("iframe").locator(".cheetah-grid");
    await gridElement.waitFor();
    const grid = gridLocator(gridElement);
    await expect(grid.cell("name", 0).click()).rejects.toThrow(
      "scaled by an ancestor transform"
    );
  });

  it("fails clearly when another element covers the cell", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/overlay-grid.html", import.meta.url).href
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("name", 1).click()).rejects.toThrow(
      'The cell is covered by another element: <div id="overlay"'
    );
  });

  it("operates without a fixed viewport", async () => {
    const context = await browser.newContext({ viewport: null });
    try {
      const noViewportPage = await context.newPage();
      await gotoFixture(noViewportPage, FIXTURE_URL);
      await noViewportPage.evaluate(() => {
        document.querySelector<HTMLElement>("#parent")!.style.height = "2000px";
      });
      await noViewportPage.waitForFunction(
        () =>
          document.querySelector<HTMLElement>(".cheetah-grid canvas")!
            .offsetHeight > 1500
      );
      const grid = gridLocator(noViewportPage.locator(".cheetah-grid"));
      await grid.cell("email", 800).click();
      const select = await noViewportPage.evaluate(
        () =>
          (
            window as unknown as {
              grid: { selection: { select: { col: number; row: number } } };
            }
          ).grid.selection.select
      );
      expect(select).toEqual({ col: 3, row: 801 });
    } finally {
      await context.close();
    }
  });

  it("operates on a tall grid under scroll-behavior: smooth", async () => {
    await page.addStyleTag({
      content: "* { scroll-behavior: smooth !important; }",
    });
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#parent")!.style.height = "2000px";
    });
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLElement>(".cheetah-grid canvas")!
          .offsetHeight > 1500
    );
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await grid.cell("email", 800).click();
    const select = await page.evaluate(
      () =>
        (
          window as unknown as {
            grid: { selection: { select: { col: number; row: number } } };
          }
        ).grid.selection.select
    );
    expect(select).toEqual({ col: 3, row: 801 });
  });

  it("rejects an ancestor locator containing multiple grids", async () => {
    await gotoFixture(
      page,
      new URL("../fixtures/two-grids.html", import.meta.url).href
    );
    await expect(
      gridLocator(page.locator("#container")).cell("fname", 0).value()
    ).rejects.toThrow("The element contains 2 grids");
    // A locator identifying a single grid still works.
    expect(
      await gridLocator(page.locator("#parent2")).cell("fname", 0).value()
    ).toBe("b0");
  });

  it("throws a clear error for an unknown field", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("unknown", 0).value()).rejects.toThrow(
      "Cell not found: field=unknown, index=0"
    );
  });
});

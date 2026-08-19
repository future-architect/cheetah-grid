import { readFile } from "node:fs/promises";
import type { Server } from "node:http";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";
import { gridLocator } from "../../src/index";

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
  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });
  serverUrl = `http://localhost:${(server.address() as AddressInfo).port}`;

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
  await page.goto(FIXTURE_URL);
  await page.waitForFunction(() => (window as { grid?: unknown }).grid != null);
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
    await page.goto(
      new URL("../fixtures/async-grid.html", import.meta.url).href
    );
    await page.waitForFunction(
      () => (window as { grid?: unknown }).grid != null
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
    await page.goto(
      new URL("../fixtures/layout-grid.html", import.meta.url).href
    );
    await page.waitForFunction(
      () => (window as { grid?: unknown }).grid != null
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

  it("rejects fill() on a menu editor cell and closes the menu", async () => {
    await page.goto(
      new URL("../fixtures/editors-grid.html", import.meta.url).href
    );
    await page.waitForFunction(
      () => (window as { grid?: unknown }).grid != null
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

  it("throws a clear error for an out-of-range cell", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("email", 5000).value()).rejects.toThrow(
      "Cell out of range: field=email, index=5000"
    );
    await expect(grid.cellAt(99, 0).rect()).rejects.toThrow(
      "Cell out of range: col=99, row=0"
    );
  });

  it("throws a clear error for an unknown field", async () => {
    const grid = gridLocator(page.locator(".cheetah-grid"));
    await expect(grid.cell("unknown", 0).value()).rejects.toThrow(
      "Cell not found: field=unknown, index=0"
    );
  });
});

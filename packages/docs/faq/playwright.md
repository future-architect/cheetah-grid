---
order: 400
---

# Automating the Grid with Playwright

Cheetah Grid renders all cells on an HTML5 `<canvas>` element, so the cells do not exist in the DOM.
This means that browser automation tools such as [Playwright](https://playwright.dev/) cannot locate cells with DOM selectors (e.g. `getByRole` or `getByText`).

Instead, you can combine the grid's API with real mouse and keyboard events:

1. Get the grid instance from an element using `cheetahGrid.ListGrid.getInstanceByElement(element)` inside `page.evaluate()`.
2. Convert the target cell into viewport coordinates using `makeVisibleCell()`, `getCellRelativeRect()` and `canvas.getBoundingClientRect()`.
3. Operate on the coordinates with `page.mouse` and `page.keyboard`. These fire real browser events, so the operation goes through the same code path as actual user interaction (hit-testing, selection, and cell actions).

::: tip
The examples below use the `cheetahGrid` global variable, which is available when loading the UMD bundle via a `<script>` tag. If your application bundles Cheetah Grid as an ES module, the global does not exist; expose it for testing, e.g. `window.cheetahGrid = cheetahGrid;`.
:::

## Clicking a Cell

The following helper clicks the cell of the given field and record index.

```ts
import type { Page } from "@playwright/test";

async function clickCell(
  page: Page,
  selector: string,
  field: string,
  index: number
): Promise<void> {
  const point = await page.evaluate(
    ([selector, field, index]) => {
      const element = document.querySelector(selector);
      const grid = cheetahGrid.ListGrid.getInstanceByElement(element);
      if (!grid) throw new Error(`Grid not found: ${selector}`);
      const cell = grid.getCellRangeByField(field, index);
      if (!cell) throw new Error(`Cell not found: ${field}[${index}]`);
      const { col, row } = cell.start;
      // Scroll to where the cell is visible.
      grid.makeVisibleCell(col, row);
      // Compute the viewport coordinates of the center of the cell.
      const rect = grid.getCellRelativeRect(col, row);
      const canvasRect = grid.canvas.getBoundingClientRect();
      return {
        x: canvasRect.left + rect.left + rect.width / 2,
        y: canvasRect.top + rect.top + rect.height / 2,
      };
    },
    [selector, field, index] as const
  );
  await page.mouse.click(point.x, point.y);
}

// Usage:
await clickCell(page, ".sample-grid", "email", 3);
```

::: warning
Do not use `page.locator("canvas").click()`. The grid places a scrollable element over the canvas, so the click fails Playwright's actionability checks. Use `page.mouse.click(x, y)` with computed coordinates as shown above.
:::

## Reading a Cell Value

```ts
async function getCellValue(
  page: Page,
  selector: string,
  field: string,
  index: number
): Promise<unknown> {
  return page.evaluate(
    ([selector, field, index]) => {
      const grid = cheetahGrid.ListGrid.getInstanceByElement(
        document.querySelector(selector)
      );
      const { col, row } = grid.getCellRangeByField(field, index).start;
      let value;
      grid.doGetCellValue(col, row, (v) => {
        value = v;
      });
      return value;
    },
    [selector, field, index] as const
  );
}
```

## Editing a Cell

After clicking a cell that has an [input action](../api/js/column_actions/InlineInputEditor.md), you can start editing it with real keyboard events.

```ts
await clickCell(page, ".sample-grid", "email", 3);
// Open the inline editor with F2 (or double-click the cell), ...
await page.keyboard.press("F2");
// ... type the new value into the editor element, ...
await page.locator("input.cheetah-grid__inline-input").fill("cat@example.com");
// ... then commit it.
await page.keyboard.press("Enter");
```

Alternatively, simply typing characters on the selected cell also opens the inline editor. Note that you must use `page.keyboard.type()` (which fires real key events) in that case; `page.keyboard.insertText()` does not open the editor.

## Waiting for Grid Events

To wait for an operation to take effect, you can listen to [grid events](../api/js/events.md) inside the page.

```ts
// Evaluate before the operation:
await page.evaluate((selector) => {
  const grid = cheetahGrid.ListGrid.getInstanceByElement(
    document.querySelector(selector)
  );
  (window as any).__changedValue = new Promise((resolve) => {
    const id = grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.CHANGED_VALUE, (e) => {
      grid.unlisten(id);
      resolve(e);
    });
  });
}, ".sample-grid");

// ... perform the edit operation, then:
const event = await page.evaluate(() => (window as any).__changedValue);
```

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

Use `getGridCellValue(field, index)` (or `getCellValue(col, row)`). If the record has not been loaded yet, it returns a promise of the value, and `page.evaluate()` automatically awaits it.

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
      return grid.getGridCellValue(field, index);
    },
    [selector, field, index] as const
  );
}
```

::: warning
The resolution of the returned promise means the value is available, not that the canvas has finished repainting it (asynchronously loaded values are drawn with a short fade-in animation). It is reliable for asserting values, but not for taking screenshots.
:::

## Editing a Cell

To replace the value of a cell that has an [input action](../api/js/column_actions/InlineInputEditor.md), open the editor and `fill()` the focused input. `fill()` replaces the whole value regardless of the caret position or text selection state in the editor, and it fails with a clear timeout if the editor did not open.

```ts
await clickCell(page, ".sample-grid", "email", 3);
// Open the editor (the current value is pre-filled).
await page.keyboard.press("F2");
// Replace the value. The editor is a real focused <input> element.
await page.locator("input:focus").fill("cat@example.com");
// Commit.
await page.keyboard.press("Enter");
```

Typing characters on a selected cell (`page.keyboard.type()`) also opens the editor, replacing the value with the typed text like a spreadsheet. However, `page.keyboard.insertText()` and `locator.fill()` cannot *start* editing: the grid opens the editor on `keypress`, and no editable element exists in the DOM until then.

## Waiting for Changes

To wait for an operation to take effect, poll the resulting state with [`expect.poll`](https://playwright.dev/docs/test-assertions#expectpoll):

```ts
await expect
  .poll(() => getCellValue(page, ".sample-grid", "email", 3))
  .toBe("cat@example.com");
```

If you need the payload of a [grid event](../api/js/events.md) itself, register a listener before the operation and keep the promise on `window`, since separate `page.evaluate()` calls do not share variables:

```ts
// Evaluate before the operation:
await page.evaluate((selector) => {
  const grid = cheetahGrid.ListGrid.getInstanceByElement(
    document.querySelector(selector)
  );
  const { promise, resolve } = Promise.withResolvers();
  const id = grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.CHANGED_VALUE, (e) => {
    grid.unlisten(id);
    resolve(e);
  });
  (window as any).__changedValue = promise;
}, ".sample-grid");

// ... perform the edit operation, then:
const event = await page.evaluate(() => (window as any).__changedValue);
```

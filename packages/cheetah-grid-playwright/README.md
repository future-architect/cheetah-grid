# cheetah-grid-playwright

Playwright helpers for driving [Cheetah Grid](https://github.com/future-architect/cheetah-grid) in browser automation.

> [!WARNING]
> This package is experimental. Breaking changes may be introduced in minor version releases.

Cheetah Grid renders all cells on an HTML5 `<canvas>` element, so cells do not exist in the DOM and cannot be located with DOM selectors. This package locates cells through the grid's API and operates on them with real mouse and keyboard events, so interactions go through the same code path as actual user input.

## Installation

```sh
npm install -D cheetah-grid-playwright
```

Requires `cheetah-grid >= 2.2` and the `cheetahGrid` namespace exposed on `window`. The UMD bundle defines `window.cheetahGrid` automatically; applications bundling the ES module must expose it themselves:

```js
import * as cheetahGrid from "cheetah-grid";

if (import.meta.env.MODE !== "production") {
  // Expose the namespace for browser automation.
  window.cheetahGrid = cheetahGrid;
}
```

The exposed namespace must be the same module instance that created the grid — `ListGrid.getInstanceByElement` cannot find grids created by another copy of the module. In particular, when using `vue-cheetah-grid` or `react-cheetah-grid`, make sure your `cheetah-grid` import resolves to the same copy that the wrapper uses.

## Usage

```ts
import { test, expect } from "@playwright/test";
import { gridLocator } from "cheetah-grid-playwright";

test("edit a cell", async ({ page }) => {
  await page.goto("/");

  const grid = gridLocator(page.locator(".cheetah-grid"));

  // Click a cell (scrolls it into view and clicks its center).
  await grid.cell("email", 3).click();

  // Replace the value of an editable cell.
  await grid.cell("email", 3).fill("cat@example.com");

  // Read a cell value (values of unloaded records are awaited).
  await expect
    .poll(() => grid.cell("email", 3).value())
    .toBe("cat@example.com");
});
```

## API

### `gridLocator(locator)`

Creates a grid locator. `locator` may point at the grid root element (`.cheetah-grid`), any element inside the grid, or an ancestor element containing the grid.

### `grid.cell(field, index)` / `grid.cellAt(col, row)`

Returns a cell locator addressed by field name and record index, or by raw column/row indices (including header rows).

### Cell locator methods

- `click()` / `dblclick()` — scrolls the cell into view and clicks its center with real mouse events.
- `fill(value)` — replaces the value of an editable cell (select, open the editor with F2, fill, commit with Enter).
- `value()` — returns the value of the cell. Values of unloaded records are awaited; header cells return their captions.
- `rect()` — scrolls the cell into view and returns its viewport rectangle, for custom mouse operations.

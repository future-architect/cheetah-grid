---
"cheetah-grid": minor
---

Added APIs useful for driving the grid from browser automation tools such as Playwright:

- Added the static method `ListGrid.getInstanceByElement(element)`, which returns the `ListGrid` instance associated with the given element.
- Added `getCellValue(col, row)` and `getGridCellValue(field, index)` methods, which return the value of the cell. Unlike `doGetCellValue`, they also return values of unloaded records (as promises) and header captions.

# cheetah-grid

## 2.2.0

### Minor Changes

- 1d721bf: Added APIs useful for driving the grid from browser automation tools such as Playwright:
  - Added the static method `ListGrid.getInstanceByElement(element)`, which returns the `ListGrid` instance associated with the given element.
  - Added `getCellValue(col, row)` and `getGridCellValue(field, index)` methods, which return the value of the cell. Unlike `doGetCellValue`, they also return values of unloaded records (as promises) and header captions.

### Patch Changes

- a3ea8f9: Fixed: `getCellsRect`/`getCellRangeRect` clamped the row direction of ranges starting in frozen rows by column widths instead of row heights, returning a wrong height on scrolled grids.
- a3ea8f9: Fixed: clicking or scrolling to a cell larger than the grid viewport no longer scrolls its start edge out of view. This also fixes cell editors closing immediately when opened on such cells (always in WebKit, and in Chrome when the grid was horizontally scrolled), which made their values impossible to edit in place.

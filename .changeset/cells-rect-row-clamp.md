---
"cheetah-grid": patch
---

Fixed: `getCellsRect`/`getCellRangeRect` clamped the row direction of ranges starting in frozen rows by column widths instead of row heights, returning a wrong height on scrolled grids.

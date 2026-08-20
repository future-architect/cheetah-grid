---
"cheetah-grid": patch
---

Fixed: clicking or scrolling to a cell larger than the grid viewport no longer scrolls its start edge out of view. This also fixes cell editors closing immediately when opened on such cells (always in WebKit, and in Chrome when the grid was horizontally scrolled), which made their values impossible to edit in place.

---
order: 250
---

# Theme

Can set theme to Cheetah Grid.  
Can settings for grid instance or global.

## Grid instance

Set a theme to the `theme` property of the grid instance.  
Built-in themes are `MATERIAL_DESIGN` and `BASIC`.

<code-preview>

::: code-group

```js [main.js]
import { createGrid } from "./grid-builder.js";
const grid = createGrid(document.querySelector(".sample1"));

const themeSelect = document.querySelector(".theme-select1");
themeSelect.onchange = function () {
  grid.theme = cheetahGrid.themes.choices[themeSelect.value];

  /* The `theme` property of the grid instance can also be set as a string. */
  // grid.theme = themeSelect.value;
};
themeSelect.onchange();
```

```html [HTML]
<label>theme</label>
<select class="theme-select1">
  <option value="" selected="true">unset</option>
  <option value="MATERIAL_DESIGN">MATERIAL_DESIGN</option>
  <option value="BASIC">BASIC</option>
</select>
<div class="sample1 demo-grid small"></div>
```

<<< ./snippets/theme/grid-builder.js

:::

</code-preview>

## Global theme

Set a theme to the `cheetahGrid.themes.default` property.
(default MATERIAL_DESIGN.)

<code-preview>

::: code-group

```js [main.js]
import { createGrid, girdInstances } from "./grid-builder.js";
createGrid(document.querySelector(".sample2"));

const themeSelect = document.querySelector(".theme-select2");
themeSelect.onchange = function () {
  cheetahGrid.themes.default = cheetahGrid.themes.choices[themeSelect.value];

  // redraw all the grids
  girdInstances.forEach((grid) => grid.invalidate());
};

themeSelect.onchange();
```

```html [HTML]
<label>theme</label>
<select class="theme-select2">
  <option value="MATERIAL_DESIGN" selected="true">MATERIAL_DESIGN</option>
  <option value="BASIC">BASIC</option>
</select>
<div class="sample2 demo-grid small"></div>
```

<<< ./snippets/theme/grid-builder.js

:::

</code-preview>

## Extend theme

To extend the theme, do as follows.

<code-preview>

::: code-group

```js [main.js]
import { createGrid } from "./grid-builder.js";
const grid = createGrid(document.querySelector(".sample3"));

const userTheme = {
  color: "red",
  frozenRowsColor: "red",
  defaultBgColor: "#FDD",
  frozenRowsBgColor: "#EAA",
  selectionBgColor: "#FDA",
  highlightBgColor: "#FDC",
  underlayBackgroundColor: "#FEE",
  // You can also change the theme apply in the state by using callback.
  frozenRowsBorderColor(args) {
    const {
      row,
      grid: { frozenRowCount },
    } = args;
    if (frozenRowCount - 1 === row) {
      return ["#F88" /*top*/, "#F88" /*right and left*/, "red" /*bottom*/];
    } else {
      return "#F88";
    }
  },
  borderColor(args) {
    const {
      col,
      grid: { colCount },
    } = args;
    if (colCount - 1 === col) {
      return ["red" /*top*/, "#F88" /*right*/, "red" /*bottom*/, null /*left*/];
    } else {
      return ["red" /*top and bottom*/, null /*right and left*/];
    }
  },
  highlightBorderColor: "#FD5",
  checkbox: {
    uncheckBgColor: "#FDD",
    checkBgColor: "rgb(255, 73, 72)",
    borderColor: "red",
  },
  button: {
    color: "#FDD",
    bgColor: "#F55",
  },
  font: "16px sans-serif",
  header: {
    sortArrowColor: "#D00",
  },
  messages: {
    infoBgColor: "gray",
    errorBgColor: "red",
    warnBgColor: "yellow",
    boxWidth: 12,
    markHeight: 15,
  },
  indicators: {
    topLeftColor: "blue",
    topLeftSize: 10,
    topRightColor: "blue",
    topRightSize: 10,
    bottomLeftColor: "blue",
    bottomLeftSize: 10,
    bottomRightColor: "blue",
    bottomRightSize: 10,
  },
};
grid.theme = userTheme;
```

```html [HTML]
<div class="sample3 demo-grid small"></div>
```

<<< ./snippets/theme/grid-builder.js

:::

</code-preview>

<script setup>
import {onBeforeUnmount} from 'vue'
onBeforeUnmount(() => {
  window.cheetahGrid.themes.default = 'MATERIAL_DESIGN'
})
</script>

---
order: 10
---

# Getting Started

## Installation

### Via npm

[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

```bash
npm install -S cheetah-grid
```

```js
import "cheetah-grid/main.css";
import * as cheetahGrid from "cheetah-grid";
```

### Via CDN

[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

```html
<link rel="stylesheet" href="https://unpkg.com/cheetah-grid@2.0/main.css" />
<script src="https://unpkg.com/cheetah-grid@2.0"></script>
```

### Via Source Code

[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

[main.mjs](https://unpkg.com/cheetah-grid@2.0/dist/main.mjs)\
[main.css](https://unpkg.com/cheetah-grid@2.0/dist/main.css)

### Via GitHub

[![GitHub package version](https://img.shields.io/github/package-json/v/future-architect/cheetah-grid.svg)](https://github.com/future-architect/cheetah-grid)

#### git clone

```bash
git clone https://github.com/future-architect/cheetah-grid.git
```

#### npm install & build

```bash
npm install
npm run build
```

built file is created in the `./packages/cheetah-grid/dist` directory

## JavaScript & HTML

Please refer to the [more documents](../api/js/index.md) for details

<code-preview>

```html
<div class="grid-sample" style="height: 500px; border: solid 1px #ddd;"></div>
```

```js
// initialize
grid = new cheetahGrid.ListGrid({
  // Parent element on which to place the grid
  parentElement: document.querySelector(".grid-sample"),
  // Header definition
  header: [
    {
      field: "check",
      caption: "",
      width: 50,
      columnType: "check",
      action: "check",
    },
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
  ],
  // Array data to be displayed on the grid
  records: generatePersons(1000),
  // Column fixed position
  frozenColCount: 2,
});
```

</code-preview>

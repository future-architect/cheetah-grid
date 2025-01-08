---
sidebarDepth: 3
order: 800
---

# MultilineTextColumn

Show multiline text.

By specifying `multilinetext` for the `columnType` property,  
You can display multiple lines of text in a cell.

## Style Properties

| Property       | Description                                                                                      | Default               |
| -------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| `lineHeight`   | Define the amount of space used for lines                                                        | --                    |
| `autoWrapText` | Define whether to wrap automatically.                                                            | --                    |
| `lineClamp`    | Define truncates text at a specific number of lines.                                             | --                    |
| `textAlign`    | Define the horizontal position of text in cell.                                                  | `'left'`              |
| `textBaseline` | Define the vertical position of text in cell.                                                    | `'top'`               |
| `color`        | Define the color of cell.                                                                        | Resolve by the theme. |
| `font`         | Define the font of cell.                                                                         | --                    |
| `padding`      | Define the padding of cell. If you set 4 values separately, please set the `Array`.              | --                    |
| `textOverflow` | Define how to display when text overflows the area of a cell. `clip` or `ellipsis` is available. | `'clip'`              |

In addition to this, the Standard styles is available.

- [Standard Column Style](../column_styles/index.md)

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "title",
      caption: "title",
      width: 150,
    },
    {
      field: "description",
      caption: "description",
      width: "calc(100% - 150px)",
      columnType: "multilinetext",
    },
  ],
  frozenColCount: 1,
  defaultRowHeight: 100,
  headerRowHeight: 40,
});
grid.records = [
  {
    title: "Lorem ipsum",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  },
  {
    title: "multilinetext",
    description: `By specifying 'multilinetext' for the 'columnType' property,
You can display multiple lines of text in a cell.`,
  },
  {
    title: "multilinetext",
    description: `プロパティ'columnType'に'multilinetext'を指定することで、  
セルに複数行テキストを表示することができます。  `,
  },
];
```

</code-preview>

### Aligns

<code-preview>

::: code-group

```js [main.js]
import records from "./records.js";
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    {
      field: "title",
      caption: "title",
      width: 150,
    },
    //textAlign
    {
      field: "description",
      caption: "left",
      width: 1000,
      columnType: "multilinetext",
      style: { textAlign: "left" },
    },
    {
      field: "description",
      caption: "right",
      width: 1000,
      columnType: "multilinetext",
      style: { textAlign: "right" },
    },
    {
      field: "description",
      caption: "center",
      width: 1000,
      columnType: "multilinetext",
      style: { textAlign: "center" },
    },
    //textBaseline
    {
      field: "description",
      caption: "top",
      width: 1000,
      columnType: "multilinetext",
      style: { textBaseline: "top" },
    },
    {
      field: "description",
      caption: "middle",
      width: 1000,
      columnType: "multilinetext",
      style: { textBaseline: "middle" },
    },
    {
      field: "description",
      caption: "bottom",
      width: 1000,
      columnType: "multilinetext",
      style: { textBaseline: "bottom" },
    },
  ],
  frozenColCount: 1,
  defaultRowHeight: 200,
  headerRowHeight: 40,
});
grid.records = records;
```

```html [HTML]
<div class="sample2 demo-grid large"></div>
```

<<< ./snippets/MultilineTextColumn/records.js

:::

</code-preview>

### lineHeight

<code-preview>

::: code-group

```js [main.js]
import records from "./records.js";
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  header: [
    {
      field: "title",
      caption: "title",
      width: 150,
    },
    {
      field: "description",
      caption: "lineHeight=3em top",
      width: 1000,
      columnType: "multilinetext",
      style: {
        lineHeight: "3em",
        textBaseline: "top",
      },
    },
    {
      field: "description",
      caption: "lineHeight=3em middle",
      width: 1000,
      columnType: "multilinetext",
      style: {
        lineHeight: "3em",
        textBaseline: "middle",
      },
    },
    {
      field: "description",
      caption: "lineHeight=3em bottom",
      width: 1000,
      columnType: "multilinetext",
      style: {
        lineHeight: "3em",
        textBaseline: "bottom",
      },
    },
  ],
  frozenColCount: 1,
  defaultRowHeight: 300,
  headerRowHeight: 40,
});
grid.records = records;
```

```html [HTML]
<div class="sample3 demo-grid large"></div>
```

<<< ./snippets/MultilineTextColumn/records.js

:::

</code-preview>

### autoWrapText

<code-preview>

::: code-group

```js [main.js]
import records from "./records.js";
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample4"),
  header: [
    {
      field: "title",
      caption: "title",
      width: 150,
    },
    {
      field: "description",
      caption: "autoWrapText=true",
      width: 600,
      columnType: "multilinetext",
      style: {
        autoWrapText: true,
      },
    },
  ],
  frozenColCount: 1,
  defaultRowHeight: 100,
  headerRowHeight: 40,
});
grid.records = records;
```

```html [HTML]
<div class="sample4 demo-grid large"></div>
```

<<< ./snippets/MultilineTextColumn/records.js

:::

</code-preview>

### lineClamp

<code-preview>

::: code-group

```js [main.js]
import records from "./records.js";
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample5"),
  header: [
    {
      field: "title",
      caption: "title",
      width: 150,
    },
    {
      field: "description",
      caption: "lineClamp=2 autoWrapText=true",
      width: 600,
      columnType: "multilinetext",
      style: {
        autoWrapText: true,
        lineClamp: 2,
      },
    },
    {
      field: "description",
      caption: 'lineClamp="auto" autoWrapText=true',
      width: 600,
      columnType: "multilinetext",
      style: {
        autoWrapText: true,
        lineClamp: "auto",
      },
    },
    {
      field: "description",
      caption: "lineClamp=2 textOverflow=ellipsis",
      width: 600,
      columnType: "multilinetext",
      style: {
        lineClamp: 2,
        textOverflow: "ellipsis",
      },
    },
  ],
  frozenColCount: 1,
  defaultRowHeight: 60,
  headerRowHeight: 40,
});
grid.records = records;
```

```html [HTML]
<div class="sample5 demo-grid middle"></div>
```

<<< ./snippets/MultilineTextColumn/records.js

:::

</code-preview>

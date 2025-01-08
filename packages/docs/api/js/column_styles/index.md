---
order: 130
---

# Define Column Styles

Define column style by using `style` property.

## Standard Column Style

Properties below are prepared in standard.

| Property               | Description                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bgColor`              | Define the background color of cell.                                                                              |
| `visibility`           | Specifying `"hidden"` to it will stop drawing the cell's content. Note that this does not stop the cell's action. |
| `indicatorTopLeft`     | Define the indicator of cell in the top left. See [Indicators](./indicators.md) for more information.             |
| `indicatorTopRight`    | Define the indicator of cell in the top right. See [Indicators](./indicators.md) for more information.            |
| `indicatorBottomRight` | Define the indicator of cell in the bottom right. See [Indicators](./indicators.md) for more information.         |
| `indicatorBottomLeft`  | Define the indicator of cell in the bottom left. See [Indicators](./indicators.md) for more information.          |

Note that the column type may add style properties that you can use. The properties added are described in the documentation for each column type.

### Standard Text Column Style

Most column types also have the style properties listed below, but not all do.

| Property       | Description                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `textAlign`    | Define the horizontal position of text in cell.                                                  |
| `textBaseline` | Define the vertical position of text in cell.                                                    |
| `color`        | Define the color of cell.                                                                        |
| `font`         | Define the font of cell.                                                                         |
| `padding`      | Define the padding of cell. If you set 4 values separately, please set the `Array`.              |
| `textOverflow` | Define how to display when text overflows the area of a cell. `clip` or `ellipsis` is available. |

### Examples

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "no", caption: "no", width: 50 },

    // default
    { field: "text", caption: "default", width: 150 },

    // color
    { field: "text", caption: "color", width: 150, style: { color: "red" } },
    // textAlign
    {
      field: "text",
      caption: "right",
      width: 150,
      style: { textAlign: "right" },
    },
    {
      field: "text",
      caption: "center",
      width: 150,
      style: { textAlign: "center" },
    },
    // textBaseline
    {
      field: "text",
      caption: "top",
      width: 150,
      style: { textBaseline: "top" },
    },
    {
      field: "text",
      caption: "bottom",
      width: 150,
      style: { textBaseline: "bottom" },
    },

    // bgColor
    {
      field: "text",
      caption: "bgColor",
      width: 150,
      style: { bgColor: "#5f5" },
    },

    // font
    {
      field: "text",
      caption: "font",
      width: 150,
      style: { font: "9px sans-serif" },
    },
  ],
});
grid.records = [
  { no: 1, text: "sample text" },
  { no: 2, text: "sample text" },
  { no: 3, text: "sample text" },
];
```

</code-preview>

<code-preview>

```html
<div class="sample2 demo-grid middle"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    { field: "no", caption: "no", width: 50 },

    // default
    { field: "text", caption: "default", width: 150 },

    // padding
    { field: "text", caption: "padding", width: 150, style: { padding: 20 } },
    {
      field: "text",
      caption: "padding",
      width: 150,
      style: { padding: [0 /*top*/, 10 /*right*/, 15 /*bottom*/, 20 /*left*/] },
    },

    //{{#if_v '0.6.0'}} textOverflow
    {
      field: "longText",
      caption: "textOverflow",
      width: 150,
      style: { textOverflow: "ellipsis" },
    },
    //{{/if_v }}
  ],
  defaultRowHeight: 80,
  headerRowHeight: 24,
});
grid.records = [
  {
    no: 1,
    text: "sample text",
    longText: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  {
    no: 2,
    text: "sample text",
    longText: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  {
    no: 3,
    text: "sample text",
    longText: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
];
```

</code-preview>

## Advanced Column Style

`style` property can be used by the advanced ways below.

- change style by each record

This can be done by functions below.

- use the function
- use the instance of Style class

<code-preview>

```html
<div class="sample3 demo-grid small"></div>
<label>change background color of text</label>
<select class="sample3theme">
  <option value="" selected="true">default</option>
  <option value="red">red</option>
  <option value="#DFF">#DFF</option>
</select>
```

```js
const textFieldStyle = new cheetahGrid.columns.style.Style();
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  header: [
    { field: "no", caption: "no", width: 50 },

    {
      field: "value",
      caption: "value",
      width: 150,
      columnType: "number",
      //function
      style(rec) {
        return {
          color: rec.value <= 0 ? "red" : undefined,
        };
      },
    },

    {
      field: "text",
      caption: "text",
      width: 150,
      //Style instance
      style: textFieldStyle,
    },
  ],
});
grid.records = [
  { no: 1, text: "sample text", value: 100 },
  { no: 2, text: "sample text", value: 50 },
  { no: 3, text: "sample text", value: 0 },
  { no: 4, text: "sample text", value: -50 },
];

const themeSelect = document.querySelector(".sample3theme");
themeSelect.onchange = function () {
  //change bg color
  if (themeSelect.value === "default") {
    textFieldStyle.bgColor = null;
  } else {
    textFieldStyle.bgColor = themeSelect.value;
  }
};
```

</code-preview>

## Header Style

Define column header style by using `headerStyle` property.

<code-preview>

```html
<div class="sample4 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample4"),
  header: [
    { field: "no", caption: "no", width: 50 },

    // default
    { field: "text", caption: "default", width: 150 },

    // color
    {
      field: "text",
      caption: "color",
      width: 150,
      headerStyle: { color: "red" },
    },
    // textAlign
    {
      field: "text",
      caption: "center",
      width: 150,
      headerStyle: { textAlign: "center" },
    },
    // textBaseline
    {
      field: "text",
      caption: "bottom",
      width: 150,
      headerStyle: { textBaseline: "bottom" },
    },
    // bgColor
    {
      field: "text",
      caption: "bgColor",
      width: 150,
      headerStyle: { bgColor: "#5f5" },
    },
    // font
    {
      field: "text",
      caption: "font",
      width: 150,
      headerStyle: { font: "9px sans-serif" },
    },
    // textOverflow
    {
      field: "text",
      caption: "textOverflow clip",
      width: 150,
      headerStyle: { textOverflow: "clip" },
    },
    {
      field: "text",
      caption: "textOverflow ellipsis",
      width: 150,
      headerStyle: {
        textOverflow: "ellipsis" /*In the header this is the default*/,
      },
    },
  ],
});
grid.records = [
  { no: 1, text: "data" },
  { no: 2, text: "data" },
  { no: 3, text: "data" },
];
```

</code-preview>

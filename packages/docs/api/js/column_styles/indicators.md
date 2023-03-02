# Indicators

You can use the style property to display the indicators.  
Currently the only indicator style supported is `"triangle"`.

## Usage

<code-preview>

```html
<div class="sample-basic demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample-basic"),
  header: [
    {
      field: "no",
      caption: "No",
      width: 50,
    },
    {
      field: "text",
      caption: "Text",
      width: 150,
      style: { indicatorTopLeft: "triangle" },
    },
    {
      field: "text",
      caption: "Text",
      width: 150,
      style: { indicatorTopRight: "triangle" },
    },
  ],
});
grid.records = [
  { no: 1, text: "data" },
  { no: 2, text: "data" },
  { no: 3, text: "data" },
  { no: 4, text: "data" },
];
```

</code-preview>

It supports `indicatorTopLeft`, `indicatorTopRight`, `indicatorBottomRight`, and `indicatorBottomLeft`

You can also control the display of indicators per record using functions.

<code-preview>

```html
<div class="sample-function demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample-function"),
  header: [
    {
      field: "no",
      caption: "No",
      width: 50,
    },
    {
      field: "text",
      caption: "Text",
      width: 150,
      style(record) {
        if (record.no === 1) {
          return { indicatorTopLeft: "triangle" };
        }
        if (record.no === 2) {
          return { indicatorTopRight: "triangle" };
        }
        if (record.no === 3) {
          return { indicatorBottomRight: "triangle" };
        }
        if (record.no === 4) {
          return { indicatorBottomLeft: "triangle" };
        }
        return undefined;
      },
    },
  ],
});
grid.records = [
  { no: 1, text: "data" },
  { no: 2, text: "data" },
  { no: 3, text: "data" },
  { no: 4, text: "data" },
];
```

</code-preview>

## Indicator Styles

We recommend using [themes](../theme.md) to control the style of the indicator.
You can control the size and color of the indicators by setting the theme's `indicators.topLeftColor`, `indicators.topLeftSize`, `indicators.topRightColor`, `indicators.topRightSize`, `indicators.bottomRightColor`, `indicators.bottomRightSize` , `indicators.bottomLeftColor`, and `indicators.bottomLeftSize` properties.

<code-preview>

```html
<div class="sample-theme demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample-theme"),
  header: [
    {
      field: "no",
      caption: "No",
      width: 50,
    },
    {
      field: "text",
      caption: "Text",
      width: 150,
      style(record) {
        if (record.no === 1) {
          return { indicatorTopLeft: "triangle" };
        }
        if (record.no === 2) {
          return { indicatorTopRight: "triangle" };
        }
        if (record.no === 3) {
          return { indicatorBottomRight: "triangle" };
        }
        if (record.no === 4) {
          return { indicatorBottomLeft: "triangle" };
        }
        return undefined;
      },
    },
  ],
});
grid.records = [
  { no: 1, text: "data" },
  { no: 2, text: "data" },
  { no: 3, text: "data" },
  { no: 4, text: "data" },
];
grid.theme = {
  indicators: {
    topLeftColor: "blue",
    topLeftSize: 10,
    topRightColor: "red",
    topRightSize: 10,
    bottomRightColor: "green",
    bottomRightSize: 10,
    bottomLeftColor: "black",
    bottomLeftSize: 10,
  },
};
```

</code-preview>

You can also specify the indicator in object form if you want to change its style individually.

<code-preview>

```html
<div class="sample-style demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample-style"),
  header: [
    {
      field: "no",
      caption: "No",
      width: 50,
    },
    {
      field: "text",
      caption: "Text",
      width: 150,
      style(record) {
        if (record.no === 3) {
          return {
            indicatorTopLeft: {
              style: "triangle",
              color: "red",
              size: 15,
            },
          };
        }
        return undefined;
      },
    },
  ],
});
grid.records = [
  { no: 1, text: "data" },
  { no: 2, text: "data" },
  { no: 3, text: "data" },
  { no: 4, text: "data" },
];
```

</code-preview>

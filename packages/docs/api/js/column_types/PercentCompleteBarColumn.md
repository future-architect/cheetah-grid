---
order: 600
---

# PercentCompleteBarColumn

Show the percent complete bar.

## Constructor Properties

| Property    | Description                           |
| ----------- | ------------------------------------- |
| `min`       | Defines the minimum value of the bar. |
| `max`       | Defines the maximum value of the bar. |
| `formatter` | Define the value display format.      |

## Style Properties

| Property       | Description                                                                                      | Default               |
| -------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| `barColor`     | Define color of bar. you can set a function that returns color from the value.                   | --                    |
| `barBgColor`   | Define background color of bar.                                                                  | --                    |
| `barHeight`    | Define height of bar.                                                                            | --                    |
| `textAlign`    | Define the horizontal position of text in cell.                                                  | `'left'`              |
| `textBaseline` | Define the vertical position of text in cell.                                                    | `'middle'`            |
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
    { field: "percent", caption: "label", width: 100 },
    {
      field: "percent",
      caption: "percent",
      width: 200,
      columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn(),
    },
    {
      field: "value",
      caption: "value(10-20)",
      width: 200,
      columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
        min: 10,
        max: 20,
      }),
    },
    {
      field: "value",
      caption: "value(format)",
      width: 200,
      columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
        min: 10,
        max: 20,
        formatter: (v) => `${v}pt`,
      }),
    },
    {
      field: "percent",
      caption: "percent2",
      width: 200,
      columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn({
        formatter: (s) => "",
      }),
      style: {
        barHeight: 19,
      },
    },
    {
      field: "percent",
      caption: "percent3",
      width: 200,
      columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn(),
      style: {
        barBgColor: "#aaa",
        barColor: "#444",
      },
    },
    {
      field: "percent",
      caption: "percent4",
      width: 200,
      columnType: new cheetahGrid.columns.type.PercentCompleteBarColumn(),
      style: {
        barBgColor: (per) => (per > 50 ? "#faa" : "#aaa"),
        barColor: (per) => (per > 50 ? "#f44" : "#444"),
      },
    },
  ],
  frozenColCount: 1,
});
grid.records = [
  { percent: "100%", value: 20 },
  { percent: "80%", value: 18 },
  { percent: "60%", value: 16 },
  { percent: "40%", value: 14 },
  { percent: "20%", value: 12 },
  { percent: "0%", value: 10 },
];
```

</code-preview>

---
order: 100
---

# NumberColumn

Show formatted numbers.

Format number with the style defined at `format` property in constructor.  
Please define the instance of `Intl.NumberFormat` class at `format` property.

If property isn't defined, format number using the instance created by `new Intl.NumberFormat()` automatically.  
Which means format style completely depends on `Intl.NumberFormat`.

In addition, this column type behave same as `columnType: 'number'`.

## Constructor Properties

| Property | Description           |
| -------- | --------------------- |
| `format` | Define number format. |

## Style Properties

| Property       | Description                                                                                      | Default               |
| -------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| `textAlign`    | Define the horizontal position of text in cell.                                                  | `'right'`             |
| `textBaseline` | Define the vertical position of text in cell.                                                    | `'middle'`            |
| `color`        | Define the color of cell.                                                                        | Resolve by the theme. |
| `font`         | Define the font of cell.                                                                         | --                    |
| `padding`      | Define the padding of cell. If you set 4 values separately, please set the `Array`.              | --                    |
| `textOverflow` | Define how to display when text overflows the area of a cell. `clip` or `ellipsis` is available. | `'clip'`              |

Standard styles is available.

- [Standard Column Style](../column_styles/index.md)

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "value",
      caption: "text",
      width: 180,
    },
    {
      field: "value",
      caption: "default",
      width: 180,
      columnType: new cheetahGrid.columns.type.NumberColumn(),
    },
    {
      field: "value",
      caption: "columnType: number",
      width: 180,
      columnType: "number",
    },
    {
      field: "value",
      caption: "JPY",
      width: 180,
      columnType: new cheetahGrid.columns.type.NumberColumn({
        format: new Intl.NumberFormat("ja-JP", {
          style: "currency",
          currency: "JPY",
        }),
      }),
    },
    {
      field: "value",
      caption: "USD",
      width: 180,
      columnType: new cheetahGrid.columns.type.NumberColumn({
        format: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }),
      }),
    },
    {
      field: "value",
      caption: "EUR",
      width: 180,
      columnType: new cheetahGrid.columns.type.NumberColumn({
        format: new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }),
      }),
    },
  ],
});
grid.records = [
  { value: 1234567890 },
  { value: 1234567890.12 },
  { value: -1234567890.123 },
  { value: -1234567890.123456 },
];
```

</code-preview>

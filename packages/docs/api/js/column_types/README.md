---
order: 120
---

# Define Column Types

## Standard Column Type

Set the column type by using `columnType`.

| property          | description                                  | LINK                                            |
| ----------------- | -------------------------------------------- | ----------------------------------------------- |
| none              | draw text in the cell                        | ---                                             |
| `'number'`        | draw number in the cell with comma-separated | [NumberColumn](./NumberColumn.md)               |
| `'check'`         | draw checkbox in the cell                    | [CheckColumn](./CheckColumn.md)                 |
| `'button'`        | draw button in the cell                      | [ButtonColumn](./ButtonColumn.md)               |
| `'image'`         | draw image in the cell                       | [ImageColumn](./ImageColumn.md)                 |
| `'multilinetext'` | draw multiline text in the cell              | [MultilineTextColumn](./MultilineTextColumn.md) |
| `'radio'`         | draw radio button in the cell                | [RadioColumn](./RadioColumn.md)                 |

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "no", caption: "no", width: 50 },

    //default
    { field: "default", caption: "default", width: 150 },
  ],
});
grid.records = [
  { no: 1, default: "sample text" },
  { no: 2, default: "sample text" },
  { no: 3, default: "sample text" },
];
```

</code-preview>

<code-preview>

```html
<div class="sample2 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    { field: "no", caption: "no", width: 50 },

    { field: "number", caption: "number", width: 180, columnType: "number" },
    {
      field: "check",
      caption: "check",
      width: 50,
      columnType: "check",
      action: "check",
    },
    {
      caption: "button",
      width: 100,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "show rec",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  { no: 1, number: 12345, check: true },
  { no: 2, number: 67890, check: false },
  { no: 3, number: 1234567890.098, check: true },
];
```

</code-preview>

## Advanced Column Type

You can try kinds of view type by defining `columnType` property using the instance.

Please refer to [here](./Classes.md)

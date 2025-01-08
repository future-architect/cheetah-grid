---
order: 200
---

# CheckColumn

Show the checkbox.

To make it editable, please use [CheckEditor](../column_actions/CheckEditor.md).

## Style Properties

| Property         | Description                                                                         | Default               |
| ---------------- | ----------------------------------------------------------------------------------- | --------------------- |
| `checkBgColor`   | Define background color of checkbox, when it is checked.                            | Resolve by the theme. |
| `uncheckBgColor` | Define background color of checkbox, when it is unchecked.                          | Resolve by the theme. |
| `borderColor`    | Define border color of checkbox.                                                    | Resolve by the theme. |
| `textAlign`      | Define horizontal position of checkbox in cell.                                     | `'center'`            |
| `textBaseline`   | Define vertical position of checkbox in cell.                                       | `'middle'`            |
| `padding`        | Define the padding of cell. If you set 4 values separately, please set the `Array`. | --                    |
| `bgColor`        | Define background color of cell.                                                    | Resolve by the theme. |

In addition to this, the Standard styles is available.

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
      field: "c1",
      caption: "check",
      width: 100,
      columnType: "check", // or `new cheetahGrid.columns.type.CheckColumn()`
    },
    {
      field: "c2",
      caption: "style",
      width: 100,
      columnType: "check",
      style: {
        uncheckBgColor: "#FDD",
        checkBgColor: "rgb(255, 73, 72)",
        borderColor: "red",
      },
    },
    {
      caption: "show",
      width: 100,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "SHOW",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec, null, "  "));
        },
      }),
    },
  ],
});
grid.records = [
  { c1: true, c2: false },
  { c1: false, c2: true },
  { c1: true, c2: false },
  { c1: false, c2: true },
  { c1: true, c2: false },
  { c1: false, c2: true },
  { c1: true, c2: false },
  { c1: false, c2: true },
  { c1: true, c2: false },
  { c1: false, c2: true },
];
```

</code-preview>

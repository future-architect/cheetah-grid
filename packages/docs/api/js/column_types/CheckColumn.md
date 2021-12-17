---
order: 200
---

# CheckColumn

Show the checkbox.

To make it editable, please use [CheckEditor](../column_actions/CheckEditor.md).

## Style Properties

| Property         | Description                                                | Default               |
| ---------------- | ---------------------------------------------------------- | --------------------- |
| `checkBgColor`   | define background color of checkbox, when it is checked.   | resolve by the theme. |
| `uncheckBgColor` | define background color of checkbox, when it is unchecked. | resolve by the theme. |
| `borderColor`    | define border color of checkbox.                           | resolve by the theme. |
| `textAlign`      | define horizontal position of checkbox in cell.            | `'center'`            |
| `textBaseline`   | define vertical position of checkbox in cell.              | --                    |
| `bgColor`        | define background color of cell.                           | resolve by the theme. |

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

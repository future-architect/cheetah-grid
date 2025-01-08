---
order: 1000
---

# RadioColumn

Show the radio button.

To make it editable, please use [RadioEditor](../column_actions/RadioEditor.md).

## Style Properties

| Property             | Description                                                    | Default               |
| -------------------- | -------------------------------------------------------------- | --------------------- |
| `checkColor`         | Define check mark color of radio button.                       | Resolve by the theme. |
| `checkBgColor`       | Define background color of radio button, when it is checked.   | Resolve by the theme. |
| `uncheckBgColor`     | Define background color of radio button, when it is unchecked. | Resolve by the theme. |
| `checkBorderColor`   | Define border color of radio button, when it is checked.       | Resolve by the theme. |
| `uncheckBorderColor` | Define border color of radio button, when it is unchecked.     | Resolve by the theme. |
| `textAlign`          | Define horizontal position of radio button in cell.            | `'center'`            |
| `textBaseline`       | Define vertical position of radio button in cell.              | `'middle'`            |
| `bgColor`            | Define background color of cell.                               | Resolve by the theme. |

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
      caption: "radio",
      width: 100,
      columnType: "radio", // or `new cheetahGrid.columns.type.RadioColumn()`
    },
    {
      field: "c2",
      caption: "style",
      width: 100,
      columnType: "radio",
      style: {
        checkColor: "rgb(255, 73, 72)",
        checkBgColor: "#FDD",
        checkBorderColor: "red",
        uncheckBgColor: "#DDF",
        uncheckBorderColor: "rgb(72, 73, 255)",
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

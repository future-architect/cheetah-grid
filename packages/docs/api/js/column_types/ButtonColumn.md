---
order: 400
---

# ButtonColumn

Show the button.

## Constructor Properties

| Property  | Description            |
| --------- | ---------------------- |
| `caption` | Define button caption. |

## Style Properties

| Property        | Description                                                                                      | Default               |
| --------------- | ------------------------------------------------------------------------------------------------ | --------------------- |
| `buttonBgColor` | Define background color of button.                                                               | Resolve by the theme. |
| `textAlign`     | Define the horizontal position of text in cell.                                                  | `'center'`            |
| `textBaseline`  | Define the vertical position of text in cell.                                                    | `'middle'`            |
| `color`         | Define the color of cell.                                                                        | Resolve by the theme. |
| `font`          | Define the font of cell.                                                                         | --                    |
| `padding`       | Define the padding of cell. If you set 4 values separately, please set the `Array`.              | --                    |
| `textOverflow`  | Define how to display when text overflows the area of a cell. `clip` or `ellipsis` is available. | `'clip'`              |

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
      caption: "Button1",
      width: 180,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "FIXED LABEL",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },

    {
      caption: "Button2",
      field: "buttonCaption", // Get caption of button from record
      width: 180,
      columnType: "button",
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  { buttonCaption: "BUTTON1" },
  { buttonCaption: "BUTTON2" },
  { buttonCaption: "BUTTON3" },
  { buttonCaption: "BUTTON4" },
  { buttonCaption: "BUTTON5" },
];
```

</code-preview>

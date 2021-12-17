---
order: 140
---

# Define Column Actions

## Standard Column Action

Define column action by using `action` property.  
Please select suitable Action class for `columnType` of same column.

| `columnType` | Specified `action` by string | Description                                       | LINK                     |
| ------------ | ---------------------------- | ------------------------------------------------- | ------------------------ |
| `check`      | `'check'`                    | Define the behavior when checkbox is clicked.     | [CheckEditor]            |
| `button`     | ---                          | Define the behavior when button is clicked.       | [ButtonAction]           |
| `input`      | `'input'`                    | Define the behavior when cell input.              | [SmallDialogInputEditor] |
| [MenuColumn] | ---                          | Define the behavior when select a menu.           | [InlineMenuEditor]       |
| `radio`      | `'radio'`                    | Define the behavior when radio button is clicked. | [RadioEditor]            |

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "no", caption: "no", width: 50 },
    // action: 'check'
    {
      field: "check",
      caption: "check",
      width: 60,
      columnType: "check",
      action: "check",
    },
    // action: 'input'
    { field: "text", caption: "input", width: 120, action: "input" },
    {
      caption: "button",
      width: 100,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "show rec",
      }),
      // ButtonAction
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  { no: 1, check: true, text: "abc" },
  { no: 2, check: false, text: "def" },
  { no: 3, check: true, text: "ghi" },
];
```

</code-preview>

## Advanced Column Action

By setting the property `action` as an Action instance,
You can change the properties of the action (disable, readonly, etc.) in the when you want.

Please refer to [here](./Classes.md)

[menucolumn]: ../column_types/MenuColumn.md
[checkeditor]: ./CheckEditor.md
[buttonaction]: ./ButtonAction.md
[smalldialoginputeditor]: ./SmallDialogInputEditor.md
[inlinemenueditor]: ./InlineMenuEditor.md
[radioeditor]: ./RadioEditor.md

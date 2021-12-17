---
order: 900
---

# Standard Properties

Action classes have some common properties.
Here, they will be described.

## `disabled` property

If set to `true`, the action will be disabled.
You can also control `disabled` for each record by specifying a function.

<code-preview>

```js
const alwaysDisabledButtonAction = new cheetahGrid.columns.action.ButtonAction({
  disabled: true,
  action(rec) {
    alert("Clicked Button!");
  },
});
const DisabledForEachRecordButtonAction =
  new cheetahGrid.columns.action.ButtonAction({
    disabled: (rec) => rec.disabled,
    action(rec) {
      alert("Clicked Button!");
    },
  });

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      caption: "Always Disabled",
      width: 180,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "BUTTON",
      }),
      action: alwaysDisabledButtonAction,
    },
    {
      caption: "Disabled",
      field: "disabled",
      columnType: "check",
      action: "check",
    },
    {
      caption: "Disabled for Each Record",
      width: 180,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "BUTTON",
      }),
      action: DisabledForEachRecordButtonAction,
    },
  ],
});
grid.records = [{ disabled: false }, { disabled: false }, { disabled: false }];
```

```html
<div class="sample1 demo-grid small"></div>
```

</code-preview>

## `readOnly` property

If set to `true`, the action will be read-only.
As with `disabled`, you can also specify a function.

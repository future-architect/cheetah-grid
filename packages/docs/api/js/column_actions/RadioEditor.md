---
order: 600
---

# RadioEditor

Define the behavior and data editing when radio button is clicked.

The record is edited after select the cell by clicking it and then push Enter or Space.

You can control the property of `readOnly` and `disabled` by setting the instance of `RadioEditor` class to `action` of the column.  
But if you define `'radio'`, as string, to `action` of the column, you can't control these properties.  
You can also disable or read-only each record by specifying a function for the `disabled` and `readOnly` properties.

## Example

<code-preview>

```html
<div class="sample1 demo-grid small"></div>

<label>change action properties : </label>
<select class="sample1mode">
  <option value="" selected="true">both false</option>
  <option value="readOnly">readOnly = true</option>
  <option value="disabled">disabled = true</option>
</select>
<span class="sample1modememo"></span>
```

```js
const radioEditorAction = new cheetahGrid.columns.action.RadioEditor();
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "check1",
      caption: "Defined by string",
      width: 220,
      columnType: "radio",
      action: "radio",
    },

    //
    {
      field: "check2",
      caption: "Defined by class instance",
      width: 220,
      columnType: "radio",
      action: radioEditorAction,
    },

    {
      caption: "Show",
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
  { check1: true, check2: false },
  { check1: false, check2: true },
  { check1: false, check2: false },
];

document.querySelector(".sample1mode").onchange = function () {
  //change action properties
  if (this.value === "readOnly") {
    radioEditorAction.readOnly = true;
    radioEditorAction.disabled = false;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle";
  } else if (this.value === "disabled") {
    radioEditorAction.readOnly = false;
    radioEditorAction.disabled = true;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle and does not respond when hovering the mouse";
  } else {
    radioEditorAction.readOnly = false;
    radioEditorAction.disabled = false;
    document.querySelector(".sample1modememo").textContent = "both false";
  }
};
```

</code-preview>

## Constructor Properties

| Property      | Description                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| `checkAction` | Defines the action to be taken when clicking or pressing the Enter or Space key.      |
| `disabled`    | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly`    | Define a boolean or predicate to control readonly. See also [the standard properties] |

[the standard properties]: ./standard-properties.md

## Properties

| Property      | Description                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| `checkAction` | Defines the action to be taken when clicking or pressing the Enter or Space key.      |
| `disabled`    | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly`    | Define a boolean or predicate to control readonly. See also [the standard properties] |

### disabled

You can control `disabled` depending on the state of the record by giving `disabled` a `function`.

<code-preview>

```html
<div class="sample3 demo-grid small"></div>
```

```js
const radioEditorAction = new cheetahGrid.columns.action.RadioEditor();
radioEditorAction.disabled = (record) => record.disabled;

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  header: [
    {
      field: "test",
      caption: "disabled?",
      width: 220,
      columnType: "radio",
      action: radioEditorAction,
    },

    //
    {
      field: "disabled",
      caption: "control",
      width: 220,
      columnType: "check",
      action: "check",
    },
  ],
});
grid.records = [
  { disabled: true, test: false },
  { disabled: false, test: true },
  { disabled: true, test: false },
];
```

</code-preview>

---
order: 300
---

# CheckEditor

Define the behavior and data editing when checkbox is clicked.

The record is edited after select the cell by clicking it and then push Enter or Space.

You can control the property of `readOnly` and `disabled` by setting the instance of `CheckEditor` class to `action` of the column.  
But if you define `'check'`, as string, to `action` of the column, you can't control these properties.  
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
const checkEditorAction = new cheetahGrid.columns.action.CheckEditor();
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "check1",
      caption: "defined by string",
      width: 220,
      columnType: "check",
      action: "check",
    },

    //
    {
      field: "check2",
      caption: "defined by class instance",
      width: 220,
      columnType: "check",
      action: checkEditorAction,
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
  { check1: true, check2: false },
  { check1: false, check2: true },
  { check1: true, check2: false },
];

document.querySelector(".sample1mode").onchange = function () {
  //change action properties
  if (this.value === "readOnly") {
    checkEditorAction.readOnly = true;
    checkEditorAction.disabled = false;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle";
  } else if (this.value === "disabled") {
    checkEditorAction.readOnly = false;
    checkEditorAction.disabled = true;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle and does not respond when hovering the mouse";
  } else {
    checkEditorAction.readOnly = false;
    checkEditorAction.disabled = false;
    document.querySelector(".sample1modememo").textContent = "both false";
  }
};
```

</code-preview>

## Data editing

Basic behavior is switching `true` and `false`.

Switchings shown below can be done as the special behavior.

| Type   | Truthy Value | Falsy Value |
| ------ | ------------ | ----------- |
| number | `1`          | `0`         |
| string | `'true'`     | `'false'`   |
| string | `'on'`       | `'off'`     |
| string | `'1'`        | `'0'`       |
| string | `'01'`       | `'00'`      |
| string | `'00001'`    | `'00000'`   |

The value regarded as truthy value in JavaScript is switched to `false`.  
The value regarded as falsy value is switched to `true`.

All numbers except `0` are switched to `0`.  
In this case, the original number will not be restored when switching again.

<code-preview>

```html
<div class="sample2 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    {
      field: "boolean",
      caption: "true/false",
      width: 100,
      columnType: "check",
      action: "check",
    },
    {
      field: "num",
      caption: "1/0",
      width: 100,
      columnType: "check",
      action: "check",
    },
    {
      field: "truefalse",
      caption: "'true'/'false'",
      width: 100,
      columnType: "check",
      action: "check",
    },
    {
      field: "onoff",
      caption: "on/off",
      width: 100,
      columnType: "check",
      action: "check",
    },
    {
      field: "onezero",
      caption: "'1'/'0'",
      width: 100,
      columnType: "check",
      action: "check",
    },
    {
      field: "numstring",
      caption: "num string",
      width: 100,
      columnType: "check",
      action: "check",
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
  {
    boolean: true,
    num: 0,
    truefalse: "true",
    onoff: "off",
    onezero: "1",
    numstring: "00",
  },
  {
    boolean: false,
    num: 1,
    truefalse: "false",
    onoff: "on",
    onezero: "0",
    numstring: "0001",
  },
  {
    boolean: true,
    num: 0,
    truefalse: "true",
    onoff: "off",
    onezero: "1",
    numstring: "00000000000",
  },
];
```

</code-preview>

## Constructor Properties

| Property   | Description                                                                           |
| ---------- | ------------------------------------------------------------------------------------- |
| `disabled` | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly` | Define a boolean or predicate to control readonly. See also [the standard properties] |

[the standard properties]: ./standard-properties.md

## Properties

| Property   | Description                                                                           |
| ---------- | ------------------------------------------------------------------------------------- |
| `disabled` | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly` | Define a boolean or predicate to control readonly. See also [the standard properties] |

### disabled

You can control `disabled` depending on the state of the record by giving `disabled` a `function`.

<code-preview>

```html
<div class="sample3 demo-grid small"></div>
```

```js
const checkEditorAction = new cheetahGrid.columns.action.CheckEditor();
checkEditorAction.disabled = (record) => record.disabled;

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  header: [
    {
      field: "test",
      caption: "disabled?",
      width: 220,
      columnType: "check",
      action: checkEditorAction,
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

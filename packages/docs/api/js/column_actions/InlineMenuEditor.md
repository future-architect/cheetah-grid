---
order: 500
---

# InlineMenuEditor

Enables data editing by menu selection.

## Constructor Properties

| Property             | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| `options` (Required) | Defines the options that can be selected.                                             |
| `disabled`           | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly`           | Define a boolean or predicate to control readonly. See also [the standard properties] |
| `classList`          | Defines the `class` to be set on the menu (`<ul>`).                                   |

[the standard properties]: ./standard-properties.md

## Properties

| Property             | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| `options` (Required) | Defines the options that can be selected.                                             |
| `disabled`           | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly`           | Define a boolean or predicate to control readonly. See also [the standard properties] |
| `classList`          | Defines the `class` to be set on the menu (`<ul>`).                                   |

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
const menuOptions = [
  { value: "", label: "Empty" },
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
  { value: "6", label: "Option 6" },
  { value: "7", label: "Option 7" },
];
const displayOptions = [
  { value: "", label: "Choose your option" },
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
  { value: "6", label: "Option 6" },
  { value: "7", label: "Option 7" },
];
const menuEditor = new cheetahGrid.columns.action.InlineMenuEditor({
  options: menuOptions,
});
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "sel",
      caption: "InlineMenuEditor",
      width: 260,
      columnType: new cheetahGrid.columns.type.MenuColumn({
        options: displayOptions,
      }),
      action: new cheetahGrid.columns.action.InlineMenuEditor({
        options: menuOptions,
      }),
    },
    {
      field: "sel2",
      caption: "controlable properties",
      width: 260,
      columnType: new cheetahGrid.columns.type.MenuColumn({
        options: displayOptions,
      }),
      action: menuEditor,
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
  { sel: "", sel2: "" },
  { sel: "1", sel2: "1" },
  { sel: "2", sel2: "2" },
  { sel: "3", sel2: "3" },
  { sel: "", sel2: "" },
  { sel: "1", sel2: "1" },
  { sel: "2", sel2: "2" },
  { sel: "3", sel2: "3" },
  { sel: "", sel2: "" },
  { sel: "1", sel2: "1" },
  { sel: "2", sel2: "2" },
  { sel: "3", sel2: "3" },
];
document.querySelector(".sample1mode").onchange = function () {
  //change action properties
  if (this.value === "readOnly") {
    menuEditor.readOnly = true;
    menuEditor.disabled = false;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle";
  } else if (this.value === "disabled") {
    menuEditor.readOnly = false;
    menuEditor.disabled = true;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle and does not respond when hovering the mouse";
  } else {
    menuEditor.readOnly = false;
    menuEditor.disabled = false;
    document.querySelector(".sample1modememo").textContent = "both false";
  }
};
```

</code-preview>

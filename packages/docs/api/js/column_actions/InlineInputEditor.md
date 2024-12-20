---
order: 450
---

# InlineInputEditor

Enables data editing by input.

## Constructor Properties

| Property    | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| `disabled`  | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly`  | Define a boolean or predicate to control readonly. See also [the standard properties] |
| `classList` | Defines the `class` to be set on the `<input>`.                                       |
| `type`      | Defines the `type` to be set on the `<input>`.                                        |

[the standard properties]: ./standard-properties.md

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
const inputEditor = new cheetahGrid.columns.action.InlineInputEditor();
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "text",
      caption: "defined by InlineInputEditor",
      width: 260,
      action: inputEditor,
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
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
  { text: "text" },
];

document.querySelector(".sample1mode").onchange = function () {
  //change action properties
  if (this.value === "readOnly") {
    inputEditor.readOnly = true;
    inputEditor.disabled = false;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle";
  } else if (this.value === "disabled") {
    inputEditor.readOnly = false;
    inputEditor.disabled = true;
    document.querySelector(".sample1modememo").textContent =
      "It will not toggle and does not respond when hovering the mouse";
  } else {
    inputEditor.readOnly = false;
    inputEditor.disabled = false;
    document.querySelector(".sample1modememo").textContent = "both false";
  }
};
```

</code-preview>

## Properties

| Property    | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| `disabled`  | Define a boolean or predicate to control disable. See also [the standard properties]  |
| `readOnly`  | Define a boolean or predicate to control readonly. See also [the standard properties] |
| `type`      | Defines the `type` attribute of the `<input>` element.                                |
| `classList` | Defines `class` of the `<input>` element.                                             |

<code-preview>

```html
<div class="sample2 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    {
      field: "number",
      caption: "type & classList",
      width: 220,
      columnType: "number",
      action: new cheetahGrid.columns.action.InlineInputEditor({
        type: "number",
        classList: ["al-right"],
      }),
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
grid.records = [{ number: 1234 }, { number: 1234.123 }, { number: -1234.123 }];
```

```css
.al-right {
  text-align: right;
}
```

</code-preview>

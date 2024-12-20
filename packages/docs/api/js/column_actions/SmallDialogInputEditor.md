---
order: 400
---

# SmallDialogInputEditor

Enables data editing by input.

You can dynamically control the `readOnly` and `disabled` property by defining an instance of the `SmallDialogInputEditor` class to the `action` column.  
But if you define `'input'`, as string, to `action` of the column, you can't control these properties.  
You can also disable or read-only each record by specifying a function for the `disabled` and `readOnly` properties.

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
const inputEditor = new cheetahGrid.columns.action.SmallDialogInputEditor();
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "text1",
      caption: "defined by string",
      width: 220,
      action: "input",
    },

    //
    {
      field: "text2",
      caption: "defined by class instance",
      width: 220,
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
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
  { text1: "text", text2: "text" },
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

## Constructor Properties

| Property         | Description                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disabled`       | Define a boolean or predicate to control disable. See also [the standard properties]                                                               |
| `readOnly`       | Define a boolean or predicate to control readonly. See also [the standard properties]                                                              |
| `type`           | Specify the `type` attribute of the `<input>` element.                                                                                             |
| `classList`      | Specify `class` of the dialog element.                                                                                                             |
| `helperText`     | Specify helper text. You can also specify a function.                                                                                              |
| `validator`      | Specify the validation function to be call before confirming the input value. If there is an error, please use the function to return the message. |
| `inputValidator` | Specify the validation function of the value of `<input>`. If there is an error, please use the function to return the message.                    |

[the standard properties]: ./standard-properties.md

## Properties

| Property         | Description                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disabled`       | Define a boolean or predicate to control disable. See also [the standard properties]                                                               |
| `readOnly`       | Define a boolean or predicate to control readonly. See also [the standard properties]                                                              |
| `type`           | Specify the `type` attribute of the `<input>` element.                                                                                             |
| `classList`      | Specify `class` of the dialog element.                                                                                                             |
| `helperText`     | Specify helper text. You can also specify a function.                                                                                              |
| `validator`      | Specify the validation function to be call before confirming the input value. If there is an error, please use the function to return the message. |
| `inputValidator` | Specify the validation function of the value of `<input>`. If there is an error, please use the function to return the message.                    |

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
      action: new cheetahGrid.columns.action.SmallDialogInputEditor({
        type: "number",
        classList: ["al-right"],
      }),
    },
    {
      field: "text",
      caption: "validator & helperText",
      width: 220,
      action: new cheetahGrid.columns.action.SmallDialogInputEditor({
        classList: "helper-text--right-justified",
        helperText(value) {
          return `${value.length}/20`;
        },
        inputValidator(value) {
          return value.length > 20
            ? `over the max length. ${value.length}`
            : null;
        },
        validator(value) {
          return value.match(/^[a-zA-Z]*$/) ? null : "Please only alphabet.";
        },
      }),
    },
    {
      field: "code",
      caption: "async validator",
      width: 220,
      action: new cheetahGrid.columns.action.SmallDialogInputEditor({
        helperText: "enter code. /^[A-Z]\\d{3}$/",
        validator(value) {
          return new Promise((r) => {
            setTimeout(() => {
              r(value.match(/^[A-Z]\d{3}$/) ? null : "Invalid code.");
            }, 500);
          });
        },
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
grid.records = [
  { number: 1234, text: "a", code: "A001" },
  { number: 1234.123, text: "b", code: "A002" },
  { number: -1234.123, text: "c", code: "A003" },
];
```

```css
.al-right input {
  text-align: right;
}
```

</code-preview>

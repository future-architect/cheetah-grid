---
order: 400
---

# Define Cell Messages

Define the message to display in each cell of the column by using `message` property.

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
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

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "text1",
      caption: "message field",
      width: 150,
      //message field
      message: "msg",
    },
    {
      field: "text2",
      caption: "input",
      width: 150,
      //message function
      message(rec) {
        return rec.text2.match(/^[a-zA-Z]*$/) ? null : "Please only alphabet.";
      },
      action: "input",
    },
    {
      field: "text3",
      caption: "inline input",
      width: 150,
      message(rec) {
        return rec.text3.match(/^[a-zA-Z]*$/) ? null : "Please only alphabet.";
      },
      action: new cheetahGrid.columns.action.InlineInputEditor(),
    },
    {
      field: "val4",
      caption: "menu",
      width: 200,
      message(rec) {
        return rec.val4 ? null : "Please select.";
      },
      columnType: new cheetahGrid.columns.type.MenuColumn({
        options: displayOptions,
      }),
      action: new cheetahGrid.columns.action.InlineMenuEditor({
        options: menuOptions,
      }),
    },
    {
      field: "check5",
      caption: "check",
      width: 100,
      message(rec) {
        return rec.check5 ? null : "Please check.";
      },
      columnType: "check",
      action: "check",
    },
    {
      field: "text1",
      caption: "info",
      width: 150,
      message(rec) {
        return {
          //info message
          type: "info",
          message: "Info Message.",
        };
      },
    },
    {
      field: "text1",
      caption: "warning",
      width: 150,
      message(rec) {
        return {
          //warning message
          type: "warning",
          message: "Warning Message.",
        };
      },
    },
  ],
});
grid.records = [
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },

  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },

  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
  {
    text1: "text",
    text2: "123",
    text3: "123",
    val4: "",
    check5: false,
    msg: "message.",
  },
];
```

</code-preview>

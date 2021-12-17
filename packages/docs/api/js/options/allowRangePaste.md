---
sidebarDepth: 3
order: 10
---

# Examples of `allowRangePaste`

- Simple Layout

<code-preview>

```html
<div class="sample1 demo-grid large"></div>
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
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  allowRangePaste: true, // Allow pasting of range.
  header: [
    {
      field: "selected",
      caption: "",
      width: 80,
      columnType: "check",
      action: "check",
    },
    { field: "personid", caption: "ID", width: 100, action: "input" },
    {
      field: "fname",
      caption: "First Name",
      width: "auto",
      minWidth: 30,
      action: "input",
    },
    {
      field: "lname",
      caption: "Last Name",
      width: "auto",
      minWidth: 30,
      action: "input",
    },
    {
      field: "email",
      caption: "Email",
      width: "auto",
      minWidth: 30,
      action: "input",
    },
    {
      field: "option",
      caption: "Option",
      width: "auto",
      minWidth: 30,
      columnType: new cheetahGrid.columns.type.MenuColumn({
        options: menuOptions,
      }),
      action: new cheetahGrid.columns.action.InlineMenuEditor({
        options: menuOptions,
      }),
    },
  ],
  frozenColCount: 1,
});

grid.records = [
  {
    personid: 1,
    fname: "Sophia",
    lname: "Hill",
    email: "sophia_hill@example.com",
    option: "",
  },
  {
    personid: 2,
    fname: "Aubrey",
    lname: "Martin",
    email: "aubrey_martin@example.com",
    option: "",
  },
  {
    personid: 3,
    fname: "Avery",
    lname: "Jones",
    email: "avery_jones@example.com",
    option: "",
  },
  {
    personid: 4,
    fname: "Joseph",
    lname: "Rodriguez",
    email: "joseph_rodriguez@example.com",
    option: "",
  },
  {
    personid: 5,
    fname: "Samuel",
    lname: "Campbell",
    email: "samuel_campbell@example.com",
    option: "",
  },
  {
    personid: 6,
    fname: "Joshua",
    lname: "Ortiz",
    email: "joshua_ortiz@example.com",
    option: "",
  },
  {
    personid: 7,
    fname: "Mia",
    lname: "Foster",
    email: "mia_foster@example.com",
    option: "",
  },
  {
    personid: 8,
    fname: "Landon",
    lname: "Lopez",
    email: "landon_lopez@example.com",
    option: "",
  },
  {
    personid: 9,
    fname: "Audrey",
    lname: "Cox",
    email: "audrey_cox@example.com",
    option: "",
  },
  {
    personid: 10,
    fname: "Anna",
    lname: "Ramirez",
    email: "anna_ramirez@example.com",
    option: "",
  },
];
```

</code-preview>

- Advanced Layout

<code-preview>

```html
<div class="sample2 demo-grid large"></div>
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
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  allowRangePaste: true, // Allow pasting of range.
  layout: {
    header: [
      [
        { caption: "", rowSpan: 2, width: 80 },
        { caption: "ID", rowSpan: 2, width: 100 },
        { caption: "First Name", width: "auto", minWidth: 30 },
        { caption: "Email", width: "auto", minWidth: 30 },
      ],
      [{ caption: "Last Name" }, { caption: "Option" }],
    ],
    body: [
      [
        { field: "selected", rowSpan: 2, columnType: "check", action: "check" },
        { field: "personid", rowSpan: 2, action: "input" },
        { field: "fname", action: "input" },
        { field: "email", action: "input" },
      ],
      [
        { field: "lname", action: "input" },
        {
          field: "option",
          columnType: new cheetahGrid.columns.type.MenuColumn({
            options: menuOptions,
          }),
          action: new cheetahGrid.columns.action.InlineMenuEditor({
            options: menuOptions,
          }),
        },
      ],
    ],
  },
  frozenColCount: 1,
});

grid.records = [
  {
    personid: 1,
    fname: "Sophia",
    lname: "Hill",
    email: "sophia_hill@example.com",
    option: "",
  },
  {
    personid: 2,
    fname: "Aubrey",
    lname: "Martin",
    email: "aubrey_martin@example.com",
    option: "",
  },
  {
    personid: 3,
    fname: "Avery",
    lname: "Jones",
    email: "avery_jones@example.com",
    option: "",
  },
  {
    personid: 4,
    fname: "Joseph",
    lname: "Rodriguez",
    email: "joseph_rodriguez@example.com",
    option: "",
  },
  {
    personid: 5,
    fname: "Samuel",
    lname: "Campbell",
    email: "samuel_campbell@example.com",
    option: "",
  },
  {
    personid: 6,
    fname: "Joshua",
    lname: "Ortiz",
    email: "joshua_ortiz@example.com",
    option: "",
  },
  {
    personid: 7,
    fname: "Mia",
    lname: "Foster",
    email: "mia_foster@example.com",
    option: "",
  },
  {
    personid: 8,
    fname: "Landon",
    lname: "Lopez",
    email: "landon_lopez@example.com",
    option: "",
  },
  {
    personid: 9,
    fname: "Audrey",
    lname: "Cox",
    email: "audrey_cox@example.com",
    option: "",
  },
  {
    personid: 10,
    fname: "Anna",
    lname: "Ramirez",
    email: "anna_ramirez@example.com",
    option: "",
  },
];
```

</code-preview>

## Cautionary Notes

Even if you set `validator` or `inputValidator` using [SmallDialogInputEditor], overwrites the pasted value even if the value is invalid.  
Use [Cell Message API] to notify the user of an invalid value.

<code-preview>

```html
<div class="sample3 demo-grid large"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  allowRangePaste: true, // Allow pasting of range.
  header: [
    {
      field: "number",
      caption: "Number",
      width: "auto",
      action: new cheetahGrid.columns.action.SmallDialogInputEditor({
        inputValidator(value) {
          return value && isNaN(value) ? "Not a number." : null;
        },
      }),
      message(record) {
        const value = record.number;
        return value && isNaN(value) ? "Not a number." : null;
      },
    },
    { field: "text", caption: "Text", width: "auto" },
  ],
});

grid.records = [
  { number: 1, text: "text" },
  { number: 2, text: "text" },
  { number: 3, text: "text" },
  { number: 4, text: "text" },
  { number: 5, text: "text" },
];
```

</code-preview>

[smalldialoginputeditor]: ../column_actions/SmallDialogInputEditor.md
[cell message api]: ../cell_message.md

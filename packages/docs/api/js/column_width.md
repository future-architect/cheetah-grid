---
order: 110
---

# Define Column Width

You can set the width of each column by using `width` property.
If nothing is set to `width` property, the value of `defaultColWidth` (property in `grid`) is used.

You can use `%`, `calc()` or `auto` by setting a string to the `width` property.

You can also set the minimum and maximum widths by setting the `minWidth` and `maxWidth` properties.

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

```js
const records = generatePersons(100);

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "check",
      caption: "",
      columnType: "check",
      action: "check",
      minWidth: 50,
      maxWidth: 50,
    },
    {
      field: "personid",
      caption: "ID",
      width: "10%",
      minWidth: "50px",
      maxWidth: "50%",
    },
    { field: "fname", caption: "First Name", width: "auto", minWidth: "120px" },
    { field: "lname", caption: "Last Name", width: "auto", minWidth: "120px" },
    {
      field: "email",
      caption: "Email",
      width: "calc(60% - 110px)",
      minWidth: "120px",
    },
  ],
  defaultColWidth: 50,
});
grid.records = records;
```

</code-preview>

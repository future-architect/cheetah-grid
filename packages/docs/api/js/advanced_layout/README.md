---
order: 600
---

# Advanced Layout

You can use the `layout` property to define advanced header and record layouts.  
(In this case, the `header` property cannot be used.)

The `layout` property is defined by an object with the `header` and the `body`.
Define an array of rows in each section, and define each element in a row.

When using the `layout` property, you can set `colSpan` and `rowSpan` for each definition element.

For example:

<code-preview>

```html
<div class="sample-layout demo-grid middle"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample-layout"),
  layout: {
    header: [
      // header line1
      [
        { caption: "ID", width: 100, rowSpan: 2 },
        { caption: "First Name", width: 200 },
        { caption: "Email", width: 250, rowSpan: 2 },
        { caption: "Birthday", width: 200, rowSpan: 2 },
      ],
      // header line2
      [{ caption: "Last Name" }],
    ],
    body: [
      // line1
      [
        { field: "personid", rowSpan: 2 },
        { field: "fname" },
        { field: "email", rowSpan: 2 },
        { field: getBirthday, rowSpan: 2 },
      ],
      // line2
      [{ field: "lname" }],
    ],
  },
  frozenColCount: 1,
});
grid.records = records;

function getBirthday(rec) {
  const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  return dateTimeFormat.format(rec.birthday);
}
```

</code-preview>

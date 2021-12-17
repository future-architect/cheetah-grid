---
order: 300
---

# Jump to the Specified Cell

Example below shows the usage of jumping to the specified cell.  
In this example, cursor jumps to cell, no column is 7.

<code-preview>

```html
<button class="jump">jump</button>
<div class="sample1 demo-grid small"></div>
```

```js
const records = [
  { check: true, no: 1, name: "Cat" },
  { check: false, no: 2, name: "Tiger" },
  { check: true, no: 3, name: "Leopard" },
  { check: false, no: 4, name: "Jaguar" },
  { check: true, no: 5, name: "Cheetah" },
  { check: true, no: 6, name: "Lion" },
  { check: false, no: 7, name: "Ocelot" },
];
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "check",
      caption: "check",
      width: 80,
      columnType: "check",
      action: "check",
    },
    {
      field: "no",
      caption: "no",
      width: 50,
    },
    {
      field: "name",
      caption: "name",
      width: 200,
    },
  ],
});
grid.records = records;

const jumpButton = document.querySelector(".jump");
jumpButton.onclick = function () {
  grid.makeVisibleGridCell("name", 6);
  grid.focusGridCell("name", 6);
};
```

</code-preview>

---
order: 100
---

# Sort by Column

Define sort settings of each column by using `sort` property.  
When you set `true` value, the records are sorted by builtin logic in Cheetah Grid.  
When you set `string` value, the records are sorted by builtin logic in Cheetah Grid, using the specified field.  
Please define function if you want to sort by your own logic.

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

```js
const records = [
  {
    no: 1,
    name: "Asiatic",
  },
  {
    no: 2,
    name: "South African",
  },
  {
    no: 3,
    name: "Tanzanian",
  },
  {
    no: 4,
    name: "Sudan",
  },
  {
    no: 5,
    name: "King",
  },
];
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "no",
      caption: "no",
      width: 50,
      // define custom sort logic
      sort(order, col, grid) {
        const compare =
          order === "desc"
            ? (v1, v2) => (v1 === v2 ? 0 : v1 > v2 ? 1 : -1)
            : (v1, v2) => (v1 === v2 ? 0 : v1 < v2 ? 1 : -1);
        records.sort((r1, r2) => compare(r1.no, r2.no));
        console.log("sorted:", records);
        grid.records = records;
      },
    },
    {
      field: "name",
      caption: "name",
      width: 200,
      // use default sort logic
      sort: true,
    },
  ],
});
grid.records = records;
```

</code-preview>

## Style Properties

| Property         | Description                                          | Default |
| ---------------- | ---------------------------------------------------- | ------- |
| `sortArrowColor` | Defines the color of the sort icon.                  | --      |
| `multiline`      | If `true`, accept multiline text caption.            | false   |
| `lineHeight`     | Define the amount of space used for lines.           | --      |
| `autoWrapText`   | Define whether to wrap automatically.                | --      |
| `lineClamp`      | Define truncates text at a specific number of lines. | --      |

In addition to this, the Standard styles is available.

- [Standard Header Style](./header_styles.md)

### Color of sort arrow

In order to change the color of the sort arrow you implement as follows.

<code-preview>

```html
<div class="sample2 demo-grid middle"></div>
```

```js
const records = [
  {
    no: 1,
    name: "Asiatic",
  },
  {
    no: 2,
    name: "South African",
  },
  {
    no: 3,
    name: "Tanzanian",
  },
  {
    no: 4,
    name: "Sudan",
  },
  {
    no: 5,
    name: "King",
  },
];
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    {
      field: "no",
      caption: "no",
      width: 50,
      sort(order, col, grid) {
        const compare =
          order === "desc"
            ? (v1, v2) => (v1 === v2 ? 0 : v1 > v2 ? 1 : -1)
            : (v1, v2) => (v1 === v2 ? 0 : v1 < v2 ? 1 : -1);
        records.sort((r1, r2) => compare(r1.no, r2.no));
        grid.records = records;
      },
      // define color of sort arrow
      headerStyle: { sortArrowColor: "red" },
    },
    {
      field: "name",
      caption: "name",
      width: 200,
      sort: true,
      // define color of sort arrow
      headerStyle() {
        return { sortArrowColor: "blue" };
      },
    },
  ],
});
grid.records = records;
```

</code-preview>

## Reset

If you set `sortState` property to `null`, the sort state is initialized.  
(only the arrow icon of the header is initialized.)

<code-preview>

```html
<div class="sample3 demo-grid middle"></div>
<button class="sample3-reset">Reset</button>
```

```js
const records = [
  {
    no: 1,
    name: "Asiatic",
  },
  {
    no: 2,
    name: "South African",
  },
  {
    no: 3,
    name: "Tanzanian",
  },
  {
    no: 4,
    name: "Sudan",
  },
  {
    no: 5,
    name: "King",
  },
];
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  header: [
    {
      field: "no",
      caption: "no",
      width: 50,
      sort(order, col, grid) {
        const compare =
          order === "desc"
            ? (v1, v2) => (v1 === v2 ? 0 : v1 > v2 ? 1 : -1)
            : (v1, v2) => (v1 === v2 ? 0 : v1 < v2 ? 1 : -1);
        records.sort((r1, r2) => compare(r1.no, r2.no));
        grid.records = records;
      },
    },
    {
      field: "name",
      caption: "name",
      width: 200,
      sort: true,
    },
  ],
});
grid.records = records;

const button = document.querySelector(".sample3-reset");
button.onclick = () => {
  grid.sortState = null;
  // does not redraw automatically, please call `invalidate`.
  grid.invalidate();
};
```

</code-preview>

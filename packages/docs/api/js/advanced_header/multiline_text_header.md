---
order: 150
---

# Define Multiline Text Header

You can display multiline text in the header by setting the `headerType` property to `'multilinetext'`.

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "item",
      caption: "Item\nName",
      width: 100,
      headerType: "multilinetext",
    },
    {
      field: "amount",
      caption: "Regular\nPrice",
      width: 120,
      headerType: "multilinetext",
    },
  ],
});
grid.records = [
  { item: "abc", amount: 123 },
  { item: "def", amount: 456 },
  { item: "ghi", amount: 789 },
];
```

</code-preview>

Note that simple text headers and headers with sort can also display multiline text using the style property `multiline: true`.

## Style Properties

| Property       | Description                                          | Default |
| -------------- | ---------------------------------------------------- | ------- |
| `lineHeight`   | Define the amount of space used for lines            | --      |
| `autoWrapText` | Define whether to wrap automatically.                | --      |
| `lineClamp`    | Define truncates text at a specific number of lines. | --      |

In addition to this, the Standard styles is available.

- [Standard Header Style](./header_styles.md)

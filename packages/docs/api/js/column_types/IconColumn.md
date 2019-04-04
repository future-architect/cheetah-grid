---
order: 700
---

# IconColumn

Show ICON using Web Font.  
Number of ICONs can be set at field.  

:::tip
When showing ICON to ordinal column, please refer to [here](../column_icon.md)
:::

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

> ICON in sample uses [Material icons](https://material.io/icons/)
>
> ```html
> <!-- Material Icons:  https://material.io/icons/ -->
> <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/icon?family=Material+Icons">
> ```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector('.sample1'),
  header: [
    {
      field: 'value',
      caption: 'value',
      width: 100,
    },
    {
      field: 'value',
      caption: 'icon',
      width: 130,
      columnType: new cheetahGrid.columns.type.IconColumn({
        className: 'material-icons',
        content: '\uE885', // https://material.io/icons/#ic_grade
      }),
      style: {
        color: 'gold'
      }
    },
  ],
});
grid.records = [
  {value: 1},
  {value: 2},
  {value: 3},
  {value: 4},
  {value: 5},
];
```

</code-preview>

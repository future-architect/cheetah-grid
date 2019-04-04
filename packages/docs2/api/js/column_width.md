---
order: 110
---

# Define Column Width

You can set the width of each column by using `width` property.
If nothing is set to `width` property, the value of `defaultColWidth` (property in `grid`) is used.

You can use `%` mode by setting value as `string`.

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

```js
const records = generatePersons(100);

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector('.sample1'),
  header: [
    {field: 'check', caption: '', /*unset width. use defaultColWidth*/ columnType: 'check', action: 'check', minWidth: 50, maxWidth: 50},
    {field: 'personid', caption: 'ID', width: '60px', minWidth: '50px', maxWidth: '50%'},
    {field: 'fname', caption: 'First Name', width: '20%', minWidth: '120px'},
    {field: 'lname', caption: 'Last Name', width: '20%', minWidth: '120px'},
    {field: 'email', caption: 'Email', width: 'calc(60% - 110px)', minWidth: '120px'},
  ],
  defaultColWidth: 50,
});
grid.records = records;
```

</code-preview>
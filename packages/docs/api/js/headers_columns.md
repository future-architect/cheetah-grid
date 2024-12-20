---
order: 100
sidebarDepth: 3
---

# Define Headers and Columns

## Standard Column

The `header` property, the property of `cheetahGrid.ListGrid`, decides the behave and appearance of columns and header cells.  
We can set this property by constructor arguments or instance property.

The `header` property must be set by objects array (`Array<object>`).  
In the standard definition, each object consists of following properties.

| Property   | Type                                                             | Description                                                                                     | LINK                              |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| caption    | `string`                                                         | define the header caption                                                                       | ---                               |
| field      | `string` &#124; `function` &#124; `{get:function,set?:function}` | define the field name, getter function, or accessor object of the record to display in the cell | ---                               |
| width      | `string` &#124; `number`                                         | define the width of column                                                                      | [link](./column_width.md)         |
| minWidth   | `string` &#124; `number`                                         | define the minimum width of column                                                              | [link](./column_width.md)         |
| maxWidth   | `string` &#124; `number`                                         | define the maximum width of column                                                              | [link](./column_width.md)         |
| columnType | `string` &#124; `object`                                         | define the type of column                                                                       | [link](./column_types/index.md)   |
| style      | `string` &#124; `object` &#124; `function`                       | define the style of column                                                                      | [link](./column_styles/index.md)  |
| action     | `string` &#124; `object`                                         | define the action of column                                                                     | [link](./column_actions/index.md) |

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

```js
/*
  record object properties
  {
    personid: 'ID',
    fname: 'First Name',
    lname: 'Last Name',
    email: 'Email',
    birthday: 'birthday',
  }
 */
const records = generatePersons(100);

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
    { field: getBirthday, caption: "Birthday", width: 200 },
  ],
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

### `field` property

`field` is one of the most basic properties. It provides the data to display from the record to the cell.
You can choose and define one of the 3 formats.

#### string format

Define the property name to get the cell data from the record as a string.

For example:

```js
const grid = new cheetahGrid.ListGrid({
  // ...
  header: [
    // ...
    {
      field: "email",
      // ...
    },
    // ...
  ],
  // ...
});
```

#### function format

Define the getter function that get the cell data from the record.

For example:

```js
const grid = new cheetahGrid.ListGrid({
  // ...
  header: [
    // ...
    {
      field: (record) => record.email,
      // ...
    },
    // ...
  ],
  // ...
});
```

#### object format

Define an object with a getter function that gets the cell data from the record and a setter function that sets the cell data to the record.

For example:

```js
const grid = new cheetahGrid.ListGrid({
  // ...
  header: [
    // ...
    {
      field: {
        get: (record) => record.email,
        set: (record, newValue) => (record.email = newValue),
      },
      // ...
    },
    // ...
  ],
  // ...
});
```

## Multiple Header

To use multiple header, set the hierarchical structured Object to the `header` property.

<code-preview>

```html
<div class="sample2 demo-grid middle"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    {
      /* multiple header */
      caption: "name",
      columns: [
        { field: "fname", caption: "First Name", width: 200 },
        { field: "lname", caption: "Last Name", width: 200 },
      ],
    },
    { field: "email", caption: "Email", width: 250 },
    { field: getBirthday, caption: "Birthday", width: 200 },
  ],
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

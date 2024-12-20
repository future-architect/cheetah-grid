---
order: 180
---

# Grid Data

Can use the `Array` object or `cheetahGrid.data.DataSource` object for grid data.

## Using `Array` object

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
  ],
  frozenColCount: 1,
});
// set array records
grid.records = [
  {
    personid: 1,
    fname: "Sophia",
    lname: "Hill",
    email: "sophia_hill@example.com",
  },
  {
    personid: 2,
    fname: "Aubrey",
    lname: "Martin",
    email: "aubrey_martin@example.com",
  },
  {
    personid: 3,
    fname: "Avery",
    lname: "Jones",
    email: "avery_jones@example.com",
  },
  {
    personid: 4,
    fname: "Joseph",
    lname: "Rodriguez",
    email: "joseph_rodriguez@example.com",
  },
  {
    personid: 5,
    fname: "Samuel",
    lname: "Campbell",
    email: "samuel_campbell@example.com",
  },
  {
    personid: 6,
    fname: "Joshua",
    lname: "Ortiz",
    email: "joshua_ortiz@example.com",
  },
  {
    personid: 7,
    fname: "Mia",
    lname: "Foster",
    email: "mia_foster@example.com",
  },
  {
    personid: 8,
    fname: "Landon",
    lname: "Lopez",
    email: "landon_lopez@example.com",
  },
  {
    personid: 9,
    fname: "Audrey",
    lname: "Cox",
    email: "audrey_cox@example.com",
  },
  {
    personid: 10,
    fname: "Anna",
    lname: "Ramirez",
    email: "anna_ramirez@example.com",
  },
];
```

</code-preview>

## Using `cheetahGrid.data.DataSource` object

<code-preview>

```html
<div class="sample2 demo-grid middle"></div>
```

```js
// define cache
const array = [];
const getPerson = (index) =>
  array[index] || (array[index] = generatePerson(index));

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
  ],
  frozenColCount: 1,
});
grid.dataSource = new cheetahGrid.data.CachedDataSource({
  // Get record method
  get(index) {
    return getPerson(index);
  },
  // Number of records
  length: 10000,
});
```

</code-preview>

`cheetahGrid.data.DataSource` has subclasses
`cheetahGrid.data.CachedDataSource` and [`cheetahGrid.data.FilterDataSource`](./FilterDataSource.md)

`CachedDataSource` has the ability to cache the return value if the record is a `Promise` object.
If you know that the record does not become `Promise`, you can use `DataSource`,
In this case it is recommended to use `CachedDataSource` as `CachedDataSource` does not change in behavior.

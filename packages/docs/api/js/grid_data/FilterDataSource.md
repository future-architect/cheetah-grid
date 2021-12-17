---
title: FilterDataSource
order: 500
---

# FilterDataSource

Filtering the data to be displayed using `FilterDataSource`.  
Generate a `FilterDataSource` instance by passing `DataSource` as the constructor argument.  
If you want to generate from array, describe as `new cheetahGrid.data.FilterDataSource(cheetahGrid.data.DataSource.ofArray(array))`.

<code-preview>

```html
<label>Filter:</label><input class="sample1-filter-input" />
<div class="sample1 demo-grid large"></div>
```

```js
/**
 * @type {DataSource}
 */
const personsDataSource = generatePersonsDataSource(1000000);
const filterDataSource = new cheetahGrid.data.FilterDataSource(
  personsDataSource
);

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "check",
      caption: "",
      width: 50,
      columnType: "check",
      action: "check",
    },
    { field: "personid", caption: "ID", width: 100 },
    {
      caption: "name",
      columns: [
        { field: "fname", caption: "First Name", width: 200 },
        { field: "lname", caption: "Last Name", width: 200 },
      ],
    },
    { field: "email", caption: "Email", width: 250 },
    {
      field(rec) {
        const d = rec.birthday;
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      },
      caption: "birthday",
      width: 100,
    },
    {
      caption: "button",
      width: 120,
      /* button column */
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "SHOW REC",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
  frozenColCount: 2,
});
grid.dataSource = filterDataSource;

const input = document.querySelector(".sample1-filter-input");
input.addEventListener("input", () => {
  const filterValue = input.value;
  filterDataSource.filter = filterValue
    ? (record) => {
        // filtering method
        for (const k in record) {
          if (`${record[k]}`.indexOf(filterValue) >= 0) {
            return true;
          }
        }
        return false;
      }
    : null;
  // Please call `invalidate()`
  grid.invalidate();
});
```

</code-preview>

## Using `Promise`s

This feature is available even if record data is `Promise`.

<code-preview>

```html
<label>Filter:</label><input class="sample2-filter-input" />
<div class="sample2 demo-grid large"></div>
```

```js
const personsDataSource = new cheetahGrid.data.CachedDataSource({
  get(index) {
    return new Promise((resolve) => {
      console.log(`get record:${index}`);
      setTimeout(() => {
        resolve(generatePerson(index));
      }, 300);
    });
  },
  length: 1000000,
});

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    {
      field: "check",
      caption: "",
      width: 50,
      columnType: "check",
      action: "check",
    },
    { field: "personid", caption: "ID", width: 100 },
    {
      caption: "name",
      columns: [
        { field: "fname", caption: "First Name", width: 200 },
        { field: "lname", caption: "Last Name", width: 200 },
      ],
    },
    { field: "email", caption: "Email", width: 250 },
    {
      field(rec) {
        const d = rec.birthday;
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      },
      caption: "birthday",
      width: 100,
    },
    {
      caption: "button",
      width: 120,
      /* button column */
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "SHOW REC",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
  frozenColCount: 2,
});
const filterDataSource = new cheetahGrid.data.FilterDataSource(
  personsDataSource
);
grid.dataSource = filterDataSource;

const input = document.querySelector(".sample2-filter-input");
input.addEventListener("input", () => {
  const filterValue = input.value;
  filterDataSource.filter = filterValue
    ? (record) => {
        // filtering method
        for (const k in record) {
          if (`${record[k]}`.indexOf(filterValue) >= 0) {
            return true;
          }
        }
        return false;
      }
    : null;
  // Please call `invalidate()`
  grid.invalidate();
});
```

</code-preview>

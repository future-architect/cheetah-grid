---
order: 200
---

# Using `Promise`s

Cheetah Grid supports `Promise` object.
We suppose the situations below as a example.

- Get the record informations as deferred  
  Get and show a few records in first view. Remaining records are shown when scrolled.
- Get the cell informations as deferred  
  Get and show the important informations in first view. Remaining details are shown later.

## `Promise` Records

Shows usage below.

In this example grid shows 1,000 recors as a whole. Getting 100 records by each ajax is supposed.

<code-preview>

```html
<textarea
  class="rec_sample_log"
  style="width: 100%; height: 100px;"
  readonly="true"
>
ajax logs</textarea
>
<div class="rec_sample demo-grid middle"></div>
```

`getRecordsWithAjax` in example code returns `Promise` object which get 100 records by ajax.

```js
const getRecordsWithAjax = (startIndex, num) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const records = [];
      for (let i = 0; i < num; i++) {
        records.push(generatePerson(startIndex + i));
      }
      const log = document.querySelector(".rec_sample_log");
      log.value += `\nAcquire ${num} data from index ${startIndex}.`;
      log.value = log.value.trim();
      log.scrollTop = log.scrollHeight;

      resolve(records);
    }, 500);
  });

// create DataSource
const loadedData = {};
const dataSource = new cheetahGrid.data.CachedDataSource({
  get(index) {
    const loadStartIndex = Math.floor(index / 100) * 100;
    if (!loadedData[loadStartIndex]) {
      const promiseObject = getRecordsWithAjax(loadStartIndex, 100); // return Promise Object
      loadedData[loadStartIndex] = promiseObject;
    }
    return loadedData[loadStartIndex].then(
      (data) => data[index - loadStartIndex]
    );
  },
  length: 1000, //all records count
});

// create cheetahGrid
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".rec_sample"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
    {
      field: (rec) => new Intl.DateTimeFormat().format(rec.birthday),
      caption: "birthday",
      width: 200,
    },
  ],
  frozenColCount: 1,
});
grid.configure("fadeinWhenCallbackInPromise", true);

// set dataSource
grid.dataSource = dataSource;
```

</code-preview>

## `Promise` Cells

Example below shows Person data. Department informations are shown later by ajax.

<code-preview>

```html
<textarea
  class="cell_sample_log"
  style="width: 100%; height: 100px;"
  readonly="true"
>
ajax logs</textarea
>
<div class="cell_sample demo-grid middle"></div>
```

`getPersonDeptWithAjax` in example code returns `Promise` object which get department information by ajax.

```js
const records = generatePersons(1000);
const depts = [
  "General Affairs",
  "Personal",
  "General Accounting",
  "Sales",
  "Sales Promotion",
  "Procurement",
  "Development",
  "Engineering",
  "Manufacturing",
  "Procurement",
  "Export",
  "Public Relations",
  "Information & Research",
  "Legal",
  "Advertising",
  "Planning",
  "Secretary",
];
const getPersonDeptWithAjax = (personid) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const dept = depts[Math.floor(Math.random() * depts.length)];
      const log = document.querySelector(".cell_sample_log");
      log.value += `\nAcquire department data of personid: ${personid}. => department: ${dept}`;
      log.value = log.value.trim();
      log.scrollTop = log.scrollHeight;

      resolve(dept);
    }, 500);
  });

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".cell_sample"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
    {
      field(rec) {
        return getPersonDeptWithAjax(rec.personid); // return Promise Object
      },
      caption: "Department",
      width: 250,
    },
  ],
  frozenColCount: 1,
});
grid.configure("fadeinWhenCallbackInPromise", true);

grid.records = records;
```

</code-preview>

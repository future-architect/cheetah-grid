---
order: 1000
---

# Auto Paging

Real time loading by scroll action.

<code-preview>

```html
<textarea class="sample_log" readonly="true">ajax logs</textarea>
<div class="sample demo-grid middle"></div>
```

```js
// create DataSource
const GET_RECORDS_SIZE = 100;
const BUFFER_RECORDS_SIZE = Math.floor(GET_RECORDS_SIZE / 2) || 1;
const loadedData = {};
let isAllLoaded = false;
const dataSource = new cheetahGrid.data.CachedDataSource({
  get(index) {
    const loadStartIndex =
      Math.floor(index / GET_RECORDS_SIZE) * GET_RECORDS_SIZE;
    if (!loadedData[loadStartIndex]) {
      const promiseObject = getRecordsWithAjax(loadStartIndex, GET_RECORDS_SIZE) // return Promise Object
        .then((data) => {
          if (isAllLoaded) {
            return data;
          }
          // length update?
          const length = loadStartIndex + data.length;
          if (data.length < GET_RECORDS_SIZE) {
            // all loaded!!
            dataSource.length = length;
            isAllLoaded = true;
          } else if (dataSource.length <= length) {
            // append length!!
            dataSource.length = length + BUFFER_RECORDS_SIZE;
          }
          return data;
        });
      loadedData[loadStartIndex] = promiseObject;
    }
    return loadedData[loadStartIndex].then(
      (data) => data[index - loadStartIndex]
    );
  },
  length: BUFFER_RECORDS_SIZE, //init records count
});

// create cheetahGrid
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
  ],
  frozenColCount: 1,
});
grid.configure("fadeinWhenCallbackInPromise", true);

// set dataSource
grid.dataSource = dataSource;

function getRecordsWithAjax(startIndex, num) {
  return new Promise((resolve) => {
    const loadedCount = startIndex + num;
    let last = false;
    if (loadedCount >= 1080) {
      num = 1080 - startIndex;
      last = true;
    }
    setTimeout(() => {
      const records = [];
      for (let i = 0; i < num; i++) {
        records.push(generatePerson(startIndex + i));
      }
      const log = document.querySelector(".sample_log");
      log.value += `\nAcquire ${num} data from index ${startIndex}.`;
      log.value = log.value.trim();
      log.scrollTop = log.scrollHeight;

      if (last && records.length) {
        const lastData = records[records.length - 1];
        lastData.fname = "Cheetah";
        lastData.lname = "Grid!!";
        lastData.email = "hello_cheetah_grid@gmail.com";
      }
      resolve(records);
    }, 500);
  });
}
```

</code-preview>

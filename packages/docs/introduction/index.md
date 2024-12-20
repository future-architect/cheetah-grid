---
sidebarDepth: 3
order: 1
---

# Introduction

## What it is

Cheetah Grid is a high performance JavaScript data table component that works on canvas

## Show **1,000,000** records without stress

You can display data of 1 million records in a **moment**.

<code-preview init-mode="preview">

```html
<div>
  <label>Grid initial processing time : </label><strong class="time"></strong
  ><br />
  <br />
  <label>theme</label
  ><select class="theme">
    <option value="default" selected="true">default</option>
  </select>
</div>
<div class="grid-sample" style="height: 500px; border: solid 1px #ddd;"></div>
```

```js
const personsDataSource = generatePersonsDataSource(1000000);

const startTime = new Date();

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".grid-sample"),
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
      /* multiple header */ caption: "Name",
      columns: [
        { field: "fname", caption: "First Name", width: 200 },
        { field: "lname", caption: "Last Name", width: 200 },
      ],
    },
    { field: "email", caption: "Email", width: 250 },
    {
      /* callback field */
      field: function (rec) {
        const d = rec.birthday;
        return (
          "" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate()
        );
      },
      caption: "Birthday",
      width: 100,
    },
    {
      caption: "Button",
      width: 120,
      /* button column */
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "SHOW REC",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action: function (rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
  frozenColCount: 2,
});
grid.dataSource = personsDataSource;

const endTime = new Date();

document.querySelector(".time").textContent = endTime - startTime + "ms";

// THEME
const themeSelect = document.querySelector(".theme");
themeSelect.onchange = function () {
  if (themeSelect.value === "default") {
    grid.theme = null;
  } else {
    grid.theme = themeSelect.value;
  }
  console.log(themeSelect.value);
};
for (let name in cheetahGrid.themes.choices) {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  themeSelect.appendChild(opt);
}
```

</code-preview>

## Simple Example

### JavaScript

<code-preview>

```html
<div class="grid-sample" style="height: 500px; border: solid 1px #ddd;"></div>
```

```js
// initialize
grid = new cheetahGrid.ListGrid({
  // Parent element on which to place the grid
  parentElement: document.querySelector(".grid-sample"),
  // Header definition
  header: [
    {
      field: "check",
      caption: "",
      width: 50,
      columnType: "check",
      action: "check",
    },
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
  ],
  // Array data to be displayed on the grid
  records: generatePersons(1000),
  // Column fixed position
  frozenColCount: 2,
});
```

</code-preview>

### Vue.js

<code-preview>

```vue
<template>
  <div style="height: 500px; border: solid 1px #ddd;">
    <c-grid :data="records" :frozen-col-count="1">
      <!-- define checkbox -->
      <c-grid-check-column field="check" width="50" />
      <c-grid-column field="personid" width="85"> ID </c-grid-column>
      <!-- multiple header -->
      <c-grid-column-group caption="Name">
        <c-grid-input-column field="fname" width="20%" min-width="150">
          First Name
        </c-grid-input-column>
        <c-grid-input-column field="lname" width="20%" min-width="150">
          Last Name
        </c-grid-input-column>
      </c-grid-column-group>
      <!-- button -->
      <c-grid-button-column
        caption="SHOW REC"
        width="120"
        @click="onClickRecord"
      />
    </c-grid>
  </div>
  <div class="grid-sample"></div>
</template>
<script>
export default {
  data: function () {
    return {
      records: generatePersons(1000),
    };
  },
  methods: {
    onClickRecord: function (rec) {
      alert(JSON.stringify(rec));
    },
  },
};
</script>
```

</code-preview>

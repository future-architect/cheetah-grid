---
order: 100
---

# Change the color of the row

You can use the `theme` to change the row color.

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const records = generatePersons(100);

const materialDesignTheme = cheetahGrid.themes.MATERIAL_DESIGN;
const userTheme = materialDesignTheme.extends({
  defaultBgColor({ row, grid }) {
    // change the color of the checked row.
    if (row < grid.frozenRowCount) {
      return null;
    }
    const record = records[row - grid.frozenRowCount];
    if (record.check) {
      return "#DDF";
    }
    return null;
  },
});

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  theme: userTheme,
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
    {
      field: (rec) => new Intl.DateTimeFormat().format(rec.birthday),
      caption: "birthday",
      width: 250,
    },
    {
      caption: "button",
      width: 120,
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
  records,
});

grid.listen(cheetahGrid.ListGrid.EVENT_TYPE.CHANGED_VALUE, () => {
  // Redraw when checkbox is changed. This is because cells other than checkboxes are not redrawn automatically.
  grid.invalidate();
});
```

</code-preview>

For the Vue component, do the following:

<code-preview>

```vue
<template>
  <div class="demo-grid middle">
    <c-grid
      ref="grid"
      :data="records"
      @changed-value="$refs.grid.invalidate()"
      :theme="userTheme"
    >
      <c-grid-check-column field="check" :width="50" />
      <c-grid-column field="personid" width="100">ID</c-grid-column>
      <c-grid-input-column field="fname" width="200" min-width="150"
        >First Name</c-grid-input-column
      >
      <c-grid-input-column field="lname" width="200" min-width="150"
        >Last Name</c-grid-input-column
      >
      <c-grid-column field="email" width="250">Email</c-grid-column>
      <c-grid-column
        :field="(rec) => new Intl.DateTimeFormat().format(rec.birthday)"
        width="250"
        >birthday</c-grid-column
      >
      <c-grid-button-column
        caption="SHOW REC"
        width="120"
        @click="onClickRecord"
      />
    </c-grid>
  </div>
</template>
<script>
import * as vueCheetahGrid from "vue-cheetah-grid";
const records = generatePersons(1000);

const materialDesignTheme = vueCheetahGrid.cheetahGrid.themes.MATERIAL_DESIGN;

export default {
  data() {
    return {
      records,
      userTheme: materialDesignTheme.extends({
        defaultBgColor({ row, grid }) {
          // change the color of the checked row.
          if (row < grid.frozenRowCount) {
            return null;
          }
          const record = records[row - grid.frozenRowCount];
          if (record.check) {
            return "#DDF";
          }
          return null;
        },
      }),
    };
  },
  methods: {
    onClickRecord(rec) {
      alert(JSON.stringify(rec));
    },
  },
};
</script>
```

</code-preview>

In addition, it can be expanded as follows:

<code-preview>

```vue
<template>
  <div class="demo-grid middle">
    <c-grid
      ref="grid"
      :data="records"
      @changed-value="$refs.grid.invalidate()"
      @selected-cell="
        (e) => {
          if (e.selected) {
            $refs.grid.invalidate();
          }
        }
      "
      :theme="userTheme"
    >
      <c-grid-check-column field="check" :width="50" />
      <c-grid-column field="personid" width="100">ID</c-grid-column>
      <c-grid-input-column field="fname" width="200" min-width="150"
        >First Name</c-grid-input-column
      >
      <c-grid-input-column field="lname" width="200" min-width="150"
        >Last Name</c-grid-input-column
      >
      <c-grid-column field="email" width="250">Email</c-grid-column>
      <c-grid-column
        :field="(rec) => new Intl.DateTimeFormat().format(rec.birthday)"
        width="250"
        >birthday</c-grid-column
      >
      <c-grid-button-column
        caption="SHOW REC"
        width="120"
        @click="onClickRecord"
      />
    </c-grid>
  </div>
</template>
<script>
import * as vueCheetahGrid from "vue-cheetah-grid";
const records = generatePersons(1000);

const materialDesignTheme = vueCheetahGrid.cheetahGrid.themes.MATERIAL_DESIGN;

export default {
  data() {
    return {
      records,
      userTheme: materialDesignTheme.extends({
        defaultBgColor({ col, row, grid }) {
          const { start, end } = grid.selection.range;
          if (end.row < grid.frozenRowCount) {
            // change the color of the selection cols.
            if (start.col <= col && col <= end.col) {
              return "#DEF";
            }
          }
          if (row < grid.frozenRowCount) {
            return null;
          }
          // change the color of the checked row.
          const record = records[row - grid.frozenRowCount];
          if (record.check) {
            return "#DDF";
          }
          return null;
        },
        borderColor({ col, row, grid }) {
          const { start, end } = grid.selection.range;
          if (end.row < grid.frozenRowCount) {
            // change the border of the selection cols.
            if (start.col === col || end.col === col) {
              return [
                "#ccc7c7",
                end.col === col ? "#BCF" : null,
                "#ccc7c7",
                start.col === col ? "#BCF" : null,
              ];
            }
          }
          return null;
        },
      }),
    };
  },
  methods: {
    onClickRecord(rec) {
      alert(JSON.stringify(rec));
    },
  },
};
</script>
```

</code-preview>

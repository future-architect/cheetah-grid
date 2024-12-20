---
order: 200
---

# Define Header Actions

## Advanced Header Action

Define header action by using `headerAction` property.  
Please select suitable Action class for `headerType` of same header.

| `headerType` | Specified `headerAction` by string | Description                                                               |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------- |
| `check`      | `'check'`                          | Define the behavior when checkbox is clicked.                             |
| `sort`       | `'sort'`                           | Define the behavior on clicked. the default behavior is to sort the data. |

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "no", caption: "no", width: 50 },
    {
      field: "check",
      width: 100,
      columnType: "check",
      action: "check",
      headerType: "check",
      headerAction: "check",
    },
    {
      field: "text",
      caption: "sort",
      width: 120,
      action: "input",
      headerType: "sort",
      headerAction: "sort",
    },
  ],
});
grid.records = [
  { no: 1, check: true, text: "abc" },
  { no: 2, check: false, text: "def" },
  { no: 3, check: true, text: "ghi" },
];

const { CHANGED_HEADER_VALUE, CHANGED_VALUE } = cheetahGrid.ListGrid.EVENT_TYPE;
grid.listen(CHANGED_HEADER_VALUE, ({ value, field }) => {
  if (field !== "check") {
    return;
  }
  // header check value on change

  for (const rec of grid.records) {
    rec[field] = value;
  }
  grid.invalidate();
});
grid.listen(CHANGED_VALUE, ({ value, field }) => {
  if (field !== "check") {
    return;
  }
  // check value on change

  grid.headerValues.set(field, false);

  grid.invalidate();
});
```

</code-preview>

## Using Vue.js

In `vue-cheetah-grid`, define the `header-action`, `header-type` property.

<code-preview>

```vue
<template>
  <div class="demo-grid small">
    <c-grid ref="grid" :data="records">
      <c-grid-column field="no" width="50"> no </c-grid-column>
      <c-grid-check-column
        field="check"
        width="100"
        header-type="check"
        header-action="check"
        @changed-header-value="onChangeHeaderValue"
        @changed-value="onChangeValue"
      />
      <c-grid-column
        field="text"
        width="120"
        header-type="sort"
        header-action="sort"
      >
        sort
      </c-grid-column>
    </c-grid>
  </div>
</template>
<script>
export default {
  data() {
    return {
      records: [
        { no: 1, check: true, text: "abc" },
        { no: 2, check: false, text: "def" },
        { no: 3, check: true, text: "ghi" },
      ],
    };
  },
  methods: {
    onChangeHeaderValue({ value }) {
      // header check value on change
      const { grid } = this.$refs;

      for (const rec of this.records) {
        rec.check = value;
      }
      grid.invalidate();
    },
    onChangeValue() {
      // check value on change
      const { grid } = this.$refs;

      grid.headerValues.set("check", false);

      grid.invalidate();
    },
  },
};
</script>
```

</code-preview>

## Using Header Action Class

By setting the property `headerAction` as an Action instance,
You can change the properties of the action (disable, etc.) in the when you want.

<!-- Please refer to [here](./Classes.md) -->

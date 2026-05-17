---
url: /cheetah-grid/documents/api/vue/components/CGridBranchGraphColumn.md
---

# CGridBranchGraphColumn

Defines branch graph column.

## Vue Template Structure

```vue
<template>
  <div class="demo-grid large">
    <c-grid :data="records">
      <c-grid-branch-graph-column :width="200" cache field="command">
        Graph
      </c-grid-branch-graph-column>
    </c-grid>
  </div>
</template>
<script>
const records = [
  {
    command: [
      { command: "commit", branch: "main" },
      { command: "tag", branch: "main", tag: "v1.1.0" },
    ],
  },
  {
    command: [{ command: "commit", branch: "develop2" }],
  },
  {
    command: [{ command: "merge", branch: { from: "main", to: "develop2" } }],
  },
  {
    command: [{ command: "merge", branch: { from: "develop3", to: "main" } }],
  },
  {
    command: [{ command: "commit", branch: "develop2" }],
  },
  {
    command: [
      { command: "branch", branch: { from: "main", to: "develop3" } },
      { command: "commit", branch: "develop3" },
    ],
  },
  {
    command: [{ command: "branch", branch: { from: "main", to: "develop2" } }],
  },
  {
    command: [{ command: "merge", branch: { from: "develop", to: "main" } }],
  },
  {
    command: [{ command: "commit", branch: "develop" }],
  },
  {
    command: [
      { command: "commit", branch: "main" },
      { command: "tag", branch: "main", tag: "v1.0.0" },
      { command: "branch", branch: { from: "main", to: "develop" } },
    ],
  },
  {
    command: [
      { command: "branch", branch: "main" },
      { command: "commit", branch: "main" },
    ],
  },
];
export default {
  data() {
    return {
      records,
    };
  },
};
</script>
```

## Slots

### `default` slot

Use this slot to set the header caption

## Properties

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| field | `object`|`string`|`function`  | Defines a column data field | `undefined` |
| width | `number`|`string`  | Defines a default column width | `undefined` |
| min-width | `number`|`string`  | Defines a column min width | `undefined` |
| max-width | `number`|`string`  | Defines a column max width | `undefined` |
| column-style | `object`|`string`|`function`  | Defines a column style. Same as [the `style` property of the JS API](../../js/column_styles/index.md). | `undefined` |
| action | `object`|`string`|`function`  | Defines an action | `undefined` |
| caption | `string`|`function`  | Defines a header caption | `''` |
| cache | `boolean`  | Enable cache | `undefined` |
| colspan | `number`|`string`  | Defines the layout colspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| filter | `string`|`function`  | Defines a vue filter name | `undefined` |
| header-action | `object`|`string`|`function`  | Defines a column header action.  Same as [the `headerAction` property of the JS API](../../js/advanced_header/header_actions.md). | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-icon | `object`|`string`  | Defines a header icon | `undefined` |
| header-style | `object`|`string`|`function`  | Defines a column header style. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| header-type | `object`|`string`|`function`  | Defines a column header type. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| icon | `object`|`string`|`function`  | Defines an icon. Same as [the `icon` property of the JS API](../../js/column_icon.md). | `undefined` |
| message | `object`|`string`|`function`  | Defines a message generation method. Same as [the `message` property of the JS API](../../js/cell_message.md). | `undefined` |
| rowspan | `number`|`string`  | Defines the layout rowspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `boolean`|`string`|`function`  | Defines a sort. See "[Sort by Column](../../js/advanced_header/column_sort.md)" for detail. | `undefined` |
| start | `string`  | Defines a start type | `undefined` |

## Methods

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

---
sidebarDepth: 3
---

# CGridBranchGraphColumn

Defines branch graph column.

## Vue Template Structure

<code-preview>

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

</code-preview>

## Slots

<!-- SLOT_DEFAULT_START -->

### `default` slot

Use this slot to set the header caption

<!-- SLOT_DEFAULT_END -->

## Properties

<!-- PROPS_TABLE_START -->

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| field | `object`&#124;`string`&#124;`function`  | Defines a column data field | `undefined` |
| width | `number`&#124;`string`  | Defines a default column width | `undefined` |
| min-width | `number`&#124;`string`  | Defines a column min width | `undefined` |
| max-width | `number`&#124;`string`  | Defines a column max width | `undefined` |
| column-style | `object`&#124;`string`&#124;`function`  | Defines a column style. Same as [the `style` property of the JS API](../../js/column_styles/index.md). | `undefined` |
| action | `object`&#124;`string`&#124;`function`  | Defines an action | `undefined` |
| caption | `string`&#124;`function`  | Defines a header caption | `''` |
| cache | `boolean`  | Enable cache | `undefined` |
| colspan | `number`&#124;`string`  | Defines the layout colspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| filter | `string`&#124;`function`  | Defines a vue filter name | `undefined` |
| header-action | `object`&#124;`string`&#124;`function`  | Defines a column header action.  Same as [the `headerAction` property of the JS API](../../js/advanced_header/header_actions.md). | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-icon | `object`&#124;`string`  | Defines a header icon | `undefined` |
| header-style | `object`&#124;`string`&#124;`function`  | Defines a column header style. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| header-type | `object`&#124;`string`&#124;`function`  | Defines a column header type. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| icon | `object`&#124;`string`&#124;`function`  | Defines an icon. Same as [the `icon` property of the JS API](../../js/column_icon.md). | `undefined` |
| message | `object`&#124;`string`&#124;`function`  | Defines a message generation method. Same as [the `message` property of the JS API](../../js/cell_message.md). | `undefined` |
| rowspan | `number`&#124;`string`  | Defines the layout rowspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `boolean`&#124;`string`&#124;`function`  | Defines a sort. See "[Sort by Column](../../js/advanced_header/column_sort.md)" for detail. | `undefined` |
| start | `string`  | Defines a start type | `undefined` |

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

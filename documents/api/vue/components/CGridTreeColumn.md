---
url: /cheetah-grid/documents/api/vue/components/CGridTreeColumn.md
---

# CGridTreeColumn

Defines tree column.

## Note

`CGridTreeColumn` component does not have the feature to open and close branch nodes, you must implement it yourself if you need it.

See also [the `TreeColumn` document](../../js/column_types/TreeColumn.md).

## Vue Template Structure

```vue
<template>
  <div class="demo-grid small">
    <c-grid :data="records" :frozen-col-count="1">
      <c-grid-tree-column :field="treeField" width="200" @click="onClickRecord">
        Tree
      </c-grid-tree-column>
      <c-grid-column field="code" width="200"> Code </c-grid-column>
    </c-grid>
  </div>
</template>
<script>
const tree = [
  {
    code: "p1",
    children: [
      {
        code: "c1_1",
        children: [
          {
            code: "d1_1_1",
          },
          {
            code: "d1_1_2",
            children: [
              {
                code: "e1_1_2_1",
              },
              {
                code: "e1_1_2_2",
              },
            ],
          },
        ],
      },
      {
        code: "c1_2",
      },
    ],
  },
  {
    code: "p2",
    children: [
      {
        code: "c2_1",
      },
      {
        code: "c2_2",
      },
    ],
  },
];

// Set the parent property to the parent node so that we can keep track of the parent node.
const buffer = [...tree];
while (buffer.length) {
  const node = buffer.shift();
  for (const child of node.children || []) {
    child.parent = node;
    buffer.push(child);
  }
}

/** Gets the specified node and its ancestor nodes. */
function* ancestors(node) {
  let n = node;
  while (n) {
    yield n;
    n = n.parent;
  }
}

export default {
  data() {
    return {
      expands: { p1: true },
    };
  },
  computed: {
    records() {
      const vm = this;

      return buildRecords(tree);

      function buildRecords(nodes) {
        const records = [];
        for (const node of nodes) {
          records.push(node);
          if (vm.expands[node.code]) {
            records.push(...buildRecords(node.children));
          }
        }
        return records;
      }
    },
  },
  methods: {
    treeField(node) {
      const hasChildren = !!node.children?.length;
      const path = [...ancestors(node)].reverse().map((node) => node.code);
      return {
        caption: node.code,
        path,
        nodeType: hasChildren ? "branch" : "leaf",
      };
    },
    onClickRecord(node) {
      this.expands[node.code] = !this.expands[node.code];
    },
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
| caption | `string`|`function`  | Defines a header caption | `''` |
| disabled | `boolean`|`function`  | Defines disabled. You can also control each record by specifying a function. | `false` |
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

## Events

| Name        | Description         |
|:------------|:--------------------|
| click | Fired when a click on cell. |

## Methods

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

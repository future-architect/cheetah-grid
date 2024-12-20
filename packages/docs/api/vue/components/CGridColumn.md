---
sidebarDepth: 3
---

# CGridColumn

Defines column.

## Vue Template Structure

<code-preview>

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" :frozen-col-count="1">
      <c-grid-column field="check" column-type="check" width="50" />
      <c-grid-column field="personid" width="85"> ID </c-grid-column>
      <c-grid-column field="fname" width="20%" min-width="150">
        First Name
      </c-grid-column>
      <c-grid-column field="lname" width="20%" min-width="150">
        Last Name
      </c-grid-column>
    </c-grid>
  </div>
</template>
<script>
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
| column-type | `object`&#124;`string`&#124;`function`  | Defines a column type | `undefined` |
| column-style | `object`&#124;`string`&#124;`function`  | Defines a column style. Same as [the `style` property of the JS API](../../js/column_styles/index.md). | `undefined` |
| action | `object`&#124;`string`&#124;`function`  | Defines an action | `undefined` |
| caption | `string`&#124;`function`  | Defines a header caption | `''` |
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

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

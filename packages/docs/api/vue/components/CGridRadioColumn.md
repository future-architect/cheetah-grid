---
sidebarDepth: 3
---

# CGridRadioColumn

Defines radio button column.

## Vue Template Structure

<code-preview>

```vue
<template>
  <div class="demo-grid small">
    <c-grid :data="records" :frozen-col-count="1">
      <c-grid-radio-column field="c1" width="100"> Radio1 </c-grid-radio-column>
      <c-grid-radio-column field="c2" width="100"> Radio2 </c-grid-radio-column>
    </c-grid>
  </div>
</template>
<script>
export default {
  data() {
    return {
      records: [
        { c1: true, c2: false },
        { c1: false, c2: true },
        { c1: false, c2: false },
        { c1: false, c2: false },
        { c1: false, c2: false },
        { c1: false, c2: false },
        { c1: false, c2: false },
        { c1: false, c2: false },
        { c1: false, c2: false },
        { c1: false, c2: false },
      ],
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
| caption | `string`&#124;`function`  | Defines a header caption | `''` |
| disabled | `boolean`&#124;`function`  | Defines disabled. You can also control each record by specifying a function. | `false` |
| readonly | `boolean`&#124;`function`  | Defines readonly. You can also control each record by specifying a function. | `false` |
| check-action | `function`  | Change the check action from the default. | `undefined` |
| colspan | `number`&#124;`string`  | Defines the layout colspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| filter | `string`&#124;`function`  | Defines a vue filter name | `undefined` |
| group | `function`  | DEPRECATED! Use `checkAction` instead. Define a function that returns a radio group. | `undefined` |
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

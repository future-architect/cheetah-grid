---
url: /cheetah-grid/documents/api/vue/components/CGridRadioColumn.md
---

# CGridRadioColumn

Defines radio button column.

## Vue Template Structure

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
| readonly | `boolean`|`function`  | Defines readonly. You can also control each record by specifying a function. | `false` |
| check-action | `function`  | Change the check action from the default. | `undefined` |
| colspan | `number`|`string`  | Defines the layout colspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| filter | `string`|`function`  | Defines a vue filter name | `undefined` |
| group | `function`  | DEPRECATED! Use `checkAction` instead. Define a function that returns a radio group. | `undefined` |
| header-action | `object`|`string`|`function`  | Defines a column header action.  Same as [the `headerAction` property of the JS API](../../js/advanced_header/header_actions.md). | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-icon | `object`|`string`  | Defines a header icon | `undefined` |
| header-style | `object`|`string`|`function`  | Defines a column header style. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| header-type | `object`|`string`|`function`  | Defines a column header type. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| icon | `object`|`string`|`function`  | Defines an icon. Same as [the `icon` property of the JS API](../../js/column_icon.md). | `undefined` |
| message | `object`|`string`|`function`  | Defines a message generation method. Same as [the `message` property of the JS API](../../js/cell_message.md). | `undefined` |
| rowspan | `number`|`string`  | Defines the layout rowspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `boolean`|`string`|`function`  | Defines a sort. See "[Sort by Column](../../js/advanced_header/column_sort.md)" for detail. | `undefined` |

## Methods

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

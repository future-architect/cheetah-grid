---
url: /cheetah-grid/documents/api/vue/components/CGridButtonColumn.md
---

# CGridButtonColumn

Defines button column.

## Vue Template Structure

```vue
<template>
  <div class="demo-grid small">
    <c-grid :data="records" :frozen-col-count="1">
      <c-grid-button-column
        caption="FIXED LABEL"
        width="120"
        @click="onClickRecord"
      >
        Button1
      </c-grid-button-column>
      <c-grid-button-column
        field="buttonCaption"
        width="120"
        @click="onClickRecord"
      >
        Button2
      </c-grid-button-column>
    </c-grid>
  </div>
</template>
<script>
export default {
  data() {
    return {
      records: [
        { buttonCaption: "BUTTON1" },
        { buttonCaption: "BUTTON2" },
        { buttonCaption: "BUTTON3" },
        { buttonCaption: "BUTTON4" },
        { buttonCaption: "BUTTON5" },
      ],
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
| caption | `string`  | Defines a button caption | `''` |
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

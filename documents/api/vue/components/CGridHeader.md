---
url: /cheetah-grid/documents/api/vue/components/CGridHeader.md
---

# CGridHeader

Defines layout header.\
Can be used in the `layout-header` slot of `CGrid`.

## Vue Template Structure

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" :frozen-col-count="1">
      <template v-slot:layout-header>
        <!-- header line1 -->
        <c-grid-layout-row>
          <c-grid-header width="85" rowspan="2">ID</c-grid-header>
          <c-grid-header width="20%" min-width="150">
            First Name
          </c-grid-header>
        </c-grid-layout-row>
        <!-- header line2 -->
        <c-grid-layout-row>
          <c-grid-header width="20%" min-width="150"> Last Name </c-grid-header>
        </c-grid-layout-row>
      </template>
      <template v-slot:layout-body>
        <!-- line1 -->
        <c-grid-layout-row>
          <c-grid-column field="personid" width="85" rowspan="2" />
          <c-grid-input-column field="fname" />
        </c-grid-layout-row>
        <!-- line2 -->
        <c-grid-layout-row>
          <c-grid-input-column field="lname" />
        </c-grid-layout-row>
      </template>
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

## Slots

### `default` slot

Use this slot to set the header caption

## Properties

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| width | `number`|`string`  | Defines a default column width | `undefined` |
| min-width | `number`|`string`  | Defines a column min width | `undefined` |
| max-width | `number`|`string`  | Defines a column max width | `undefined` |
| caption | `string`|`function`  | Defines a header caption | `''` |
| colspan | `number`|`string`  | Defines the layout colspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| header-action | `object`|`string`|`function`  | Defines a column header action.  Same as [the `headerAction` property of the JS API](../../js/advanced_header/header_actions.md). | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-icon | `object`|`string`  | Defines a header icon | `undefined` |
| header-style | `object`|`string`|`function`  | Defines a column header style. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| header-type | `object`|`string`|`function`  | Defines a column header type. Same as [the `headerStyle` property of the JS API](../../js/advanced_header/header_styles.md) | `undefined` |
| rowspan | `number`|`string`  | Defines the layout rowspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `boolean`|`string`|`function`  | Defines a sort. See "[Sort by Column](../../js/advanced_header/column_sort.md)" for detail. | `undefined` |

## Methods

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

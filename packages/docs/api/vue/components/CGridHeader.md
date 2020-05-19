---
sidebarDepth: 3
---

# CGridHeader

Defines layout header.  
Can be used in the `layout-header` slot of `CGrid`.

## Vue Template Structure

<code-preview>

```vue
<div class="demo-grid middle">
  <c-grid
    :data="records"
    :frozen-col-count="1">
    <template slot="layout-header">
      <!-- header line1 -->
      <c-grid-layout-row>
        <c-grid-header width="85" rowspan="2">ID</c-grid-header>
        <c-grid-header
          width="20%"
          min-width="150"
        >
          First Name
        </c-grid-header>
      </c-grid-layout-row>
      <!-- header line2 -->
      <c-grid-layout-row>
        <c-grid-header
          width= "20%"
          min-width="150"
        >
          Last Name
        </c-grid-header>
      </c-grid-layout-row>
    </template>
    <template slot="layout-body">
      <!-- line1 -->
      <c-grid-layout-row>
        <c-grid-column field="personid" width="85" rowspan="2"/>
        <c-grid-input-column
          field="fname"
        />
      </c-grid-layout-row>
      <!-- line2 -->
      <c-grid-layout-row>
        <c-grid-input-column
          field="lname"
        />
      </c-grid-layout-row>
    </template>
  </c-grid>
</div>
```

```js
export default {
  data() {
    return {
      records
    }
  }
};
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
| width | `number`&#124;`string`  | Defines a default column width | `undefined` |
| min-width | `number`&#124;`string`  | Defines a column min width | `undefined` |
| max-width | `number`&#124;`string`  | Defines a column max width | `undefined` |
| caption | `string`&#124;`function`  | Defines a header caption | `''` |
| colspan | `number`&#124;`string`  | Defines the layout colspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| header-action | `object`&#124;`string`&#124;`function`  | Defines a column header action | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-style | `object`&#124;`string`&#124;`function`  | Defines a column header style | `undefined` |
| header-type | `object`&#124;`string`&#124;`function`  | Defines a column header type | `undefined` |
| rowspan | `number`&#124;`string`  | Defines the layout rowspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `string`&#124;`function`&#124;`boolean`  | Defines a sort | `undefined` |

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

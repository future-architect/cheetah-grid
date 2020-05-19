---
sidebarDepth: 3
---

# CGridColumnGroup

Defines multiple header.  
Can be used in the `default` slot of `CGrid`.

## Vue Template Structure

<code-preview>

```vue
<div class="demo-grid middle">
  <c-grid
    :data="records"
    :frozen-col-count="1">
    <c-grid-column field="personid" width= "85">ID</c-grid-column>
    <!-- multiple header -->
    <c-grid-column-group
      caption="Name">
      <c-grid-input-column
        field="fname"
        width="20%"
        min-width="150"
      >
        First Name
      </c-grid-input-column>
      <c-grid-input-column
        field="lname"
        width= "20%"
        min-width="150"
      >
        Last Name
      </c-grid-input-column>
    </c-grid-column-group>
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

Use this slot to set the children columns definition

<!-- SLOT_DEFAULT_END -->

## Properties

<!-- PROPS_TABLE_START -->

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| caption | `string`&#124;`function`  | Defines a header caption | `''` |
| header-action | `object`&#124;`string`&#124;`function`  | Defines a column header action | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-style | `object`&#124;`string`&#124;`function`  | Defines a column header style | `undefined` |
| header-type | `object`&#124;`string`&#124;`function`  | Defines a column header type | `undefined` |
| sort | `string`&#124;`function`&#124;`boolean`  | Defines a sort | `undefined` |

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

---
sidebarDepth: 3
---

# CGridCheckColumn

Defines checkbox column.

## Vue Template Structure

<code-preview>

```vue
<div class="demo-grid small">
  <c-grid
    :data="records"
    :frozen-col-count="1">
    <c-grid-check-column
      field="c1"
      width="100"
    >
      Check1
    </c-grid-check-column>
    <c-grid-check-column
      field="c2"
      width="100"
    >
      Check2
    </c-grid-check-column>
  </c-grid>
</div>
```

```js
export default {
  data() {
    return {
      records: [
        {c1: true, c2: false},
        {c1: false, c2: true},
        {c1: true, c2: false},
        {c1: false, c2: true},
        {c1: true, c2: false},
        {c1: false, c2: true},
        {c1: true, c2: false},
        {c1: false, c2: true},
        {c1: true, c2: false},
        {c1: false, c2: true},
      ]
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
| field | `Object`&#124;`String`&#124;`Function`  | Defines a column data field | `undefined` |
| width | `Number`&#124;`String`  | Defines a default column width | `undefined` |
| min-width | `Number`&#124;`String`  | Defines a column min width | `undefined` |
| max-width | `Number`&#124;`String`  | Defines a column max width | `undefined` |
| column-style | `Object`&#124;`String`&#124;`Function`  | Defines a column style | `undefined` |
| caption | `String`  | Defines a header caption | `''` |
| disabled | `Boolean`&#124;`Function`  | Defines disabled | `false` |
| readonly | `Boolean`&#124;`Function`  | Defines readonly | `false` |
| filter | `String`&#124;`Function`  | Defines a vue filter name | `undefined` |
| header-action | `Object`&#124;`String`&#124;`Function`  | Defines a column header action | `undefined` |
| header-field | `String`  | Defines a column header data field | `undefined` |
| header-style | `Object`&#124;`String`&#124;`Function`  | Defines a column header style | `undefined` |
| header-type | `Object`&#124;`String`&#124;`Function`  | Defines a column header type | `undefined` |
| icon | `Object`&#124;`String`&#124;`Function`  | Defines an icon | `undefined` |
| message | `Object`&#124;`String`&#124;`Function`  | Defines a Message generation method | `undefined` |
| sort | `String`&#124;`Function`&#124;`Boolean`  | Defines a sort | `undefined` |

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

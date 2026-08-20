---
url: /cheetah-grid/documents/api/vue/components/CGridLinkColumn.md
---

# CGridLinkColumn

Defines link column.

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
| column-type | `object`|`string`|`function`  | Defines a column type | `undefined` |
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
| href | `string`|`function`  | Defines a href | `undefined` |
| icon | `object`|`string`|`function`  | Defines an icon. Same as [the `icon` property of the JS API](../../js/column_icon.md). | `undefined` |
| message | `object`|`string`|`function`  | Defines a message generation method. Same as [the `message` property of the JS API](../../js/cell_message.md). | `undefined` |
| rowspan | `number`|`string`  | Defines the layout rowspan.This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `boolean`|`string`|`function`  | Defines a sort. See "[Sort by Column](../../js/advanced_header/column_sort.md)" for detail. | `undefined` |
| target | `string`  | Defines an anchor target | `undefined` |

## Methods

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

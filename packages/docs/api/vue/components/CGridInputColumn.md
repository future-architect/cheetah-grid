---
sidebarDepth: 3
---

# CGridInputColumn

Defines input column.

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
| column-style | `object`&#124;`string`&#124;`function`  | Defines a column style | `undefined` |
| caption | `string`&#124;`function`  | Defines a header caption | `''` |
| disabled | `boolean`&#124;`function`  | Defines disabled | `false` |
| readonly | `boolean`&#124;`function`  | Defines readonly | `false` |
| colspan | `number`&#124;`string`  | Defines the layout colspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| filter | `string`&#124;`function`  | Defines a vue filter name | `undefined` |
| header-action | `object`&#124;`string`&#124;`function`  | Defines a column header action | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-style | `object`&#124;`string`&#124;`function`  | Defines a column header style | `undefined` |
| header-type | `object`&#124;`string`&#124;`function`  | Defines a column header type | `undefined` |
| helper-text | `string`&#124;`function`  | Defines a helper text ganarator | `undefined` |
| icon | `object`&#124;`string`&#124;`function`  | Defines an icon | `undefined` |
| input-class-list | `Array`&#124;`string`&#124;`function`  | Defines an input class name | `undefined` |
| input-type | `string`&#124;`function`  | Defines an input type | `undefined` |
| input-validator | `function`  | Defines an input validator | `undefined` |
| message | `object`&#124;`string`&#124;`function`  | Defines a Message generation method | `undefined` |
| rowspan | `number`&#124;`string`  | Defines the layout rowspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `string`&#124;`function`&#124;`boolean`  | Defines a sort | `undefined` |
| validator | `function`  | Defines a validator | `undefined` |

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

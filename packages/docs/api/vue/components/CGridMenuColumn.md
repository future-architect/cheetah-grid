---
sidebarDepth: 3
---

# CGridMenuColumn

Defines select menu column.

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
| display-options | `Object`&#124;`Array`  | Defines a menu options for display | `undefined` |
| editor-options | `Object`&#124;`Array`  | Defines a menu options for popup | `undefined` |
| filter | `String`&#124;`Function`  | Defines a vue filter name | `undefined` |
| header-action | `Object`&#124;`String`&#124;`Function`  | Defines a column header action | `undefined` |
| header-field | `String`  | Defines a column header data field | `undefined` |
| header-style | `Object`&#124;`String`&#124;`Function`  | Defines a column header style | `undefined` |
| header-type | `Object`&#124;`String`&#124;`Function`  | Defines a column header type | `undefined` |
| icon | `Object`&#124;`String`&#124;`Function`  | Defines an icon | `undefined` |
| message | `Object`&#124;`String`&#124;`Function`  | Defines a Message generation method | `undefined` |
| options | `Object`&#124;`Array`  | Defines a menu options | `undefined` |
| sort | `String`&#124;`Function`&#124;`Boolean`  | Defines a sort | `undefined` |

<!-- PROPS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

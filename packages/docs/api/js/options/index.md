---
sidebarDepth: 3
order: 9000
---

# Options and Properties

## `cheetahGrid.ListGrid`

### Constructor Options

| Property                             | Type                 | Description                                                                                                                  |
| :----------------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| header                               | HeadersDefine        | Define simple headers and layout. This property cannot be used with the `layout` property. See [Define Headers and Columns]. |
| layout                               | LayoutDefine         | Define advanced headers and layout. This property cannot be used with the `header` property. See [Advanced Layout].          |
| records                              | Array                | Records. This property cannot be used with the `dataSource` property. See [Grid Data].                                       |
| dataSource                           | DataSource           | The data source that supplies the records. This property cannot be used with the `records` property. See [Grid Data].        |
| parentElement                        | HTMLElement          | Specify the parent element.                                                                                                  |
| frozenColCount                       | number               | Specify the number of columns to be frozen to the left.                                                                      |
| defaultRowHeight                     | number               | Specify the default grid rows height.                                                                                        |
| defaultColWidth                      | number               | Specify the default grid columns width.                                                                                      |
| headerRowHeight                      | number[] / number    | Specify the header row(s) height.                                                                                            |
| theme                                | ThemeDefine / string | Specify the theme. See [Theme].                                                                                              |
| font                                 | string               | Specify the default font.                                                                                                    |
| underlayBackgroundColor              | string               | Specify the underlay background color.                                                                                       |
| allowRangePaste                      | boolean              | Specify `true` to allow pasting of the range. See [Examples of allowRangePaste].                                             |
| trimOnPaste                          | boolean              | Specify `true`, trim the pasted text on pasting.                                                                             |
| disableColumnResize                  | boolean              | Specify `true` to disable column resize.                                                                                     |
| keyboardOptions.moveCellOnTab        | boolean / function   | Specify `true` to enable cell movement by Tab key. You can also specify a function that determines which cell to move to.    |
| keyboardOptions.moveCellOnEnter      | boolean / function   | Specify `true` to enable cell movement by Enter key. You can also specify a function that determines which cell to move to.  |
| keyboardOptions.deleteCellValueOnDel | boolean              | Specify `true` to enable enable deletion of cell values with the Del and BS keys.                                            |
| keyboardOptions.selectAllOnCtrlA     | boolean              | Specify `true` to enable select all cells by Ctrl + A key.                                                                   |

### Properties

| Property                | Type                 | Description                                |
| :---------------------- | :------------------- | :----------------------------------------- |
| header                  | HeadersDefine        | Same as the constructor option.            |
| layout                  | LayoutDefine         | Same as the constructor option.            |
| records                 | Array                | Same as the constructor option.            |
| dataSource              | DataSource           | Same as the constructor option.            |
| frozenColCount          | number               | Same as the constructor option.            |
| defaultRowHeight        | number               | Same as the constructor option.            |
| defaultColWidth         | number               | Same as the constructor option.            |
| theme                   | ThemeDefine / string | Same as the constructor option.            |
| font                    | string               | Same as the constructor option.            |
| underlayBackgroundColor | string               | Same as the constructor option.            |
| allowRangePaste         | boolean              | Same as the constructor option.            |
| trimOnPaste             | boolean              | Same as the constructor option.            |
| keyboardOptions         | object               | Same as the constructor option.            |
| sortState               | SortState            | Sort state.                                |
| headerValues            | Map                  | A map of the values entered in the header. |

[define headers and columns]: ../headers_columns.md
[advanced layout]: ../advanced_layout/index.md
[grid data]: ../grid_data/index.md
[theme]: ../theme.md
[examples of allowrangepaste]: ./allowRangePaste.md

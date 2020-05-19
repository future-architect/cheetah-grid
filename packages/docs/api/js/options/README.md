---
sidebarDepth: 3
order: 9000
---

# Options

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
| keyboardOptions.moveCellOnTab        | boolean              | Specify `true` to enable cell movement by Tab key.                                                                           |
| keyboardOptions.moveCellOnEnter      | boolean              | Specify `true` to enable cell movement by Enter key.                                                                         |
| keyboardOptions.deleteCellValueOnDel | boolean              | Specify `true` to enable enable deletion of cell values with the Del and BS keys.                                            |
| keyboardOptions.selectAllOnCtrlA     | boolean              | Specify `true` to enable selectt all cells by Ctrl + A key.                                                                  |

[Define Headers and Columns]: ../headers_columns.md
[Advanced Layout]: ../advanced_layout/README.md
[Grid Data]: ../grid_data/README.md
[Theme]: ../theme.md
[Examples of allowRangePaste]: ./allowRangePaste.md

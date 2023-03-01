---
order: 170
---

# Define Header Styles

## Standard Header Style

Define header style by using `headerStyle` property.

Properties below are prepared in standard.

| Property       | Description                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `color`        | Define the color of header cell.                                                                        |
| `textAlign`    | Define the horizontal position of text in header cell.                                                  |
| `textBaseline` | Define the vertical position of text in header cell.                                                    |
| `bgColor`      | Define the background color of header cell.                                                             |
| `font`         | Define the font of header cell.                                                                         |
| `padding`      | Define the padding of header cell. If you set 4 values separately, please set the `Array`.              |
| `textOverflow` | Define how to display when text overflows the area of a header cell. `clip` or `ellipsis` is available. |

## Style Properties Per Header Type

### Simple Text Header

Additional properties are available for simple text headers:

| Property       | Description                                          |
| -------------- | ---------------------------------------------------- |
| `multiline`    | If `true`, accept multiline text caption.            |
| `lineHeight`   | Define the amount of space used for lines.           |
| `autoWrapText` | Define whether to wrap automatically.                |
| `lineClamp`    | Define truncates text at a specific number of lines. |

### Checkbox Header

Additional properties are available for checkbox headers:

| Property         | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `checkBgColor`   | Define background color of checkbox, when it is checked.   |
| `uncheckBgColor` | Define background color of checkbox, when it is unchecked. |
| `borderColor`    | Define border color of checkbox.                           |

### Multiline Text Header

Check out [Define Multiline Text Header](./multiline_text_header.md#style-properties).

### Sort Header

Check out [Sort by Column](./column_sort.md#style-properties).

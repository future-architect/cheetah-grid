---
sidebarDepth: 3
order: 20
---

# keyboardOptions

You can set the keyboard operation.

## Focus and Edit

If not set, the user can operate the cell with the keyboard as follows.

|           Cell            |       Arrow       | Ctrl (or Meta) + Arrow |    Home or End     |    Ctrl (or Meta) + Home or End    |                 Enter                 |        Tab        |               Space                |   Backspace    |     Delete     |
| :-----------------------: | :---------------: | :--------------------: | :----------------: | :--------------------------------: | :-----------------------------------: | :---------------: | :--------------------------------: | :------------: | :------------: |
|    Normal (can't Edit)    |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                  --                   |     (native)      |                 --                 |       --       |       --       |
|           Input           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           Enter input mode.           |     (native)      | Enter input mode. And input space. |       --       |       --       |
|    Input (Input Mode)     |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   Apply input and exit input mode.    |     (native)      |           (input native)           | (input native) | (input native) |
|       Inline Input        |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           Enter input mode.           |     (native)      | Enter input mode. And input space. |       --       |       --       |
| Inline Input (Input Mode) |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   Apply input and exit input mode.    |     (native)      |           (input native)           | (input native) | (input native) |
|           Check           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Toggle.                |     (native)      |              Toggle.               |       --       |       --       |
|         Dropdown          |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |          Enter select mode.           |     (native)      |                 --                 |       --       |       --       |
|  Dropdown (Select Mode)   | Change selection. |        (native)        |      (native)      |              (native)              | Apply selection and exit select mode. | Change selection. |                 --                 |       --       |       --       |
|          Button           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Action.                |     (native)      |              Action.               |       --       |       --       |

### `moveCellOnTab`

Set to `true` to enable cell movement by `Tab` key.  
If `keyboardOptions.moveCellOnTab` is set to `true`, the user can operate the cell with the keyboard as follows.

|           Cell            |       Arrow       | Ctrl (or Meta) + Arrow |    Home or End     |    Ctrl (or Meta) + Home or End    |                 Enter                 |                         Tab                         |               Space                |   Backspace    |     Delete     |
| :-----------------------: | :---------------: | :--------------------: | :----------------: | :--------------------------------: | :-----------------------------------: | :-------------------------------------------------: | :--------------------------------: | :------------: | :------------: |
|    Normal (can't Edit)    |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                  --                   |           **Move one to next on right.**            |                 --                 |       --       |       --       |
|           Input           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           Enter input mode.           |           **Move one to next on right.**            | Enter input mode. And input space. |       --       |       --       |
|    Input (Input Mode)     |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   Apply input and exit input mode.    |                      (native)                       |           (input native)           | (input native) | (input native) |
|       Inline Input        |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           Enter input mode.           |           **Move one to next on right.**            | Enter input mode. And input space. |       --       |       --       |
| Inline Input (Input Mode) |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   Apply input and exit input mode.    |           **Move one to next on right.**            |           (input native)           | (input native) | (input native) |
|           Check           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Toggle.                |           **Move one to next on right.**            |              Toggle.               |       --       |       --       |
|         Dropdown          |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |          Enter select mode.           |           **Move one to next on right.**            |                 --                 |       --       |       --       |
|  Dropdown (Select Mode)   | Change selection. |        (native)        |      (native)      |              (native)              | Apply selection and exit select mode. | **Move one to next on right.** And apply selection. |                 --                 |       --       |       --       |
|          Button           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Action.                |           **Move one to next on right.**            |              Action.               |       --       |       --       |

### `moveCellOnEnter`

Set to `true` to enable cell movement by `Enter` key.  
If `keyboardOptions.moveCellOnEnter` is set to `true`, the user can operate the cell with the keyboard as follows.

|           Cell            |       Arrow       | Ctrl (or Meta) + Arrow |    Home or End     |    Ctrl (or Meta) + Home or End    |                       Enter                        |                        Tab                        |               Space                |   Backspace    |     Delete     |
| :-----------------------: | :---------------: | :--------------------: | :----------------: | :--------------------------------: | :------------------------------------------------: | :-----------------------------------------------: | :--------------------------------: | :------------: | :------------: |
|    Normal (can't Edit)    |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           **Move one to next on down.**            |           _Move one to next on right._            |                 --                 |       --       |       --       |
|           Input           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                 Enter input mode.                  |           _Move one to next on right._            | Enter input mode. And input space. |       --       |       --       |
|    Input (Input Mode)     |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   **Move one to next on down.** And apply input.   |                     (native)                      |           (input native)           | (input native) | (input native) |
|       Inline Input        |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                 Enter input mode.                  |           _Move one to next on right._            | Enter input mode. And input space. |       --       |       --       |
| Inline Input (Input Mode) |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   **Move one to next on down.** And apply input.   |           _Move one to next on right._            |           (input native)           | (input native) | (input native) |
|           Check           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           **Move one to next on down.**            |           _Move one to next on right._            |              Toggle.               |       --       |       --       |
|         Dropdown          |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                 Enter select mode.                 |           _Move one to next on right._            |                 --                 |       --       |       --       |
|  Dropdown (Select Mode)   | Change selection. |        (native)        |      (native)      |              (native)              | **Move one to next on down.** And apply selection. | _Move one to next on right._ And apply selection. |                 --                 |       --       |       --       |
|          Button           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           **Move one to next on down.**            |           _Move one to next on right._            |              Action.               |       --       |       --       |

### `deleteCellValueOnDel`

Set to `true` to enable enable deletion of cell values with the `Del` and `BS` keys.  
If `keyboardOptions.deleteCellValueOnDel` is set to `true`, the user can operate the cell with the keyboard as follows.

|           Cell            |       Arrow       | Ctrl (or Meta) + Arrow |    Home or End     |    Ctrl (or Meta) + Home or End    |                      Enter                       |                        Tab                        |               Space                |                     Backspace                     |                      Delete                       |
| :-----------------------: | :---------------: | :--------------------: | :----------------: | :--------------------------------: | :----------------------------------------------: | :-----------------------------------------------: | :--------------------------------: | :-----------------------------------------------: | :-----------------------------------------------: |
|    Normal (can't Edit)    |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           _Move one to next on down._            |           _Move one to next on right._            |                 --                 |                        --                         |                        --                         |
|           Input           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Enter input mode.                 |           _Move one to next on right._            | Enter input mode. And input space. |                 **Delete value.**                 |                 **Delete value.**                 |
|    Input (Input Mode)     |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   _Move one to next on down._ And apply input.   |                     (native)                      |           (input native)           |                  (input native)                   |                  (input native)                   |
|       Inline Input        |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Enter input mode.                 |           _Move one to next on right._            | Enter input mode. And input space. |                 **Delete value.**                 |                 **Delete value.**                 |
| Inline Input (Input Mode) |  (input native)   |     (input native)     |   (input native)   |           (input native)           |   _Move one to next on down._ And apply input.   |           _Move one to next on right._            |           (input native)           |                  (input native)                   |                  (input native)                   |
|           Check           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           _Move one to next on down._            |           _Move one to next on right._            |              Toggle.               |                        --                         |                        --                         |
|         Dropdown          |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |                Enter select mode.                |           _Move one to next on right._            |                 --                 | **Delete value**, if the cell value can be empty. | **Delete value**, if the cell value can be empty. |
|  Dropdown (Select Mode)   | Change selection. |        (native)        |      (native)      |              (native)              | _Move one to next on down._ And apply selection. | _Move one to next on right._ And apply selection. |                 --                 |                        --                         |                        --                         |
|          Button           |     Move one.     |     Move to edge.      | Move to side edge. | Move to upper left or lower right. |           _Move one to next on down._            |           _Move one to next on right._            |              Action.               |                        --                         |                        --                         |

### `selectAllOnCtrlA`

Set to `true` to enable selectt all cells by `Ctrl + A`.

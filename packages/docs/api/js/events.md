---
order: 200
---

# Events

You can set an event listener using the `listen(type, listener)` method.

Please get the event type from [`cheetahGrid.ListGrid.EVENT_TYPE`](https://future-architect.github.io/cheetah-grid/documents/tsdoc/interfaces/listgidevents.html).

<code-preview>

```html
<textarea class="log" style="width: 100%; height: 100px;">Event logs</textarea>
<input class="include-mouse" type="checkbox" /><label
  >Include mousemove,mouseenter,mouseleave in the log</label
>
<div class="sample1 demo-grid middle"></div>
```

```js
const lang =
  navigator.language || navigator.userLanguage || navigator.browserLanguage;
const records = generatePersons(100);
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "check",
      caption: "",
      width: 60,
      columnType: "check",
      action: "check",
    },
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200, action: "input" },
    { field: "lname", caption: "Last Name", width: 200, action: "input" },
    { field: "email", caption: "Email", width: 250, action: "input" },
    {
      field(rec) {
        return rec.birthday.toLocaleString(lang, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      caption: "birthday",
      width: 500,
    },
  ],
  frozenColCount: 1,
  records,
});

const log = (typeName, args) => {
  const el = document.querySelector(".log");
  el.value += `\nEvent: ${typeName} , args (${args
    .map(JSON.stringify)
    .join(", ")})`;
  el.value = el.value.trim();
  el.scrollTop = el.scrollHeight;
};

const {
  CLICK_CELL,
  DBLCLICK_CELL,
  DBLTAP_CELL,
  MOUSEDOWN_CELL,
  MOUSEUP_CELL,
  SELECTED_CELL,
  KEYDOWN,
  MOUSEMOVE_CELL,
  MOUSEENTER_CELL,
  MOUSELEAVE_CELL,
  MOUSEOVER_CELL,
  MOUSEOUT_CELL,
  INPUT_CELL,
  PASTE_CELL,
  RESIZE_COLUMN,
  SCROLL,
  CHANGED_VALUE,
} = cheetahGrid.ListGrid.EVENT_TYPE;

grid.listen(CLICK_CELL, (...args) => log(CLICK_CELL, args));
grid.listen(DBLCLICK_CELL, (...args) => log(DBLCLICK_CELL, args));
grid.listen(DBLTAP_CELL, (...args) => log(DBLTAP_CELL, args));
grid.listen(MOUSEDOWN_CELL, (...args) => log(MOUSEDOWN_CELL, args));
grid.listen(MOUSEUP_CELL, (...args) => log(MOUSEUP_CELL, args));
grid.listen(SELECTED_CELL, (...args) => log(SELECTED_CELL, args));
grid.listen(KEYDOWN, (...args) => log(KEYDOWN, args));
grid.listen(INPUT_CELL, (...args) => log(INPUT_CELL, args));
grid.listen(PASTE_CELL, (...args) => log(PASTE_CELL, args));
grid.listen(RESIZE_COLUMN, (...args) => log(RESIZE_COLUMN, args));
grid.listen(SCROLL, (...args) => log(SCROLL, args));

grid.listen(CHANGED_VALUE, (...args) => log(CHANGED_VALUE, args));

grid.listen(MOUSEMOVE_CELL, (...args) => {
  if (!document.querySelector(".include-mouse").checked) {
    return;
  }
  log(MOUSEMOVE_CELL, args);
});
grid.listen(MOUSEENTER_CELL, (...args) => {
  if (!document.querySelector(".include-mouse").checked) {
    return;
  }
  log(MOUSEENTER_CELL, args);
});
grid.listen(MOUSELEAVE_CELL, (...args) => {
  if (!document.querySelector(".include-mouse").checked) {
    return;
  }
  log(MOUSELEAVE_CELL, args);
});
```

</code-preview>

| Event Name                                  | Description                                                      |
| :------------------------------------------ | :--------------------------------------------------------------- |
| EVENT_TYPE.CLICK_CELL                       | Fires when the cell was clicked.                                 |
| EVENT_TYPE.DBLCLICK_CELL                    | Fires when the cell was double-clicked.                          |
| EVENT_TYPE.DBLTAP_CELL                      | Fires when the cell was double-taped.                            |
| EVENT_TYPE.MOUSEDOWN_CELL                   | Fires when pointing device button is pressed in a cell.          |
| EVENT_TYPE.MOUSEUP_CELL                     | Fires when pointing device button is released in a cell.         |
| EVENT_TYPE.SELECTED_CELL                    | Fires when the cell selection state has changed.                 |
| EVENT_TYPE.KEYDOWN                          | Fires key-downed.                                                |
| EVENT_TYPE.MOUSEMOVE_CELL                   | TBA                                                              |
| EVENT_TYPE.MOUSEENTER_CELL                  | TBA                                                              |
| EVENT_TYPE.MOUSELEAVE_CELL                  | TBA                                                              |
| EVENT_TYPE.MOUSEOVER_CELL                   | TBA                                                              |
| EVENT_TYPE.MOUSEOUT_CELL                    | TBA                                                              |
| EVENT_TYPE.CONTEXTMENU_CELL                 | Fires when the user attempts to open a context menu in the cell. |
| EVENT_TYPE.INPUT_CELL                       | TBA                                                              |
| EVENT_TYPE.PASTE_CELL                       | TBA                                                              |
| EVENT_TYPE.DELETE_CELL                      | TBA                                                              |
| EVENT_TYPE.EDITABLEINPUT_CELL               | TBA                                                              |
| EVENT_TYPE.MODIFY_STATUS_EDITABLEINPUT_CELL | TBA                                                              |
| EVENT_TYPE.RESIZE_COLUMN                    | Fires when the column width has changed.                         |
| EVENT_TYPE.SCROLL                           | Fires when scrolled.                                             |
| EVENT_TYPE.FOCUS_GRID                       | Fires when grid focus is activated.                              |
| EVENT_TYPE.BLUR_GRID                        | Fires when grid focus is inactivated.                            |
| EVENT_TYPE.BEFORE_CHANGE_VALUE              | Notifies that before the cell value changes.                     |
| EVENT_TYPE.CHANGED_VALUE                    | Fires when the cell value was changed.                           |
| EVENT_TYPE.CHANGED_HEADER_VALUE             | Fires when the header cell value was changed.                    |
| EVENT_TYPE.REJECTED_PASTE_VALUES            | Notifies that the pasted value has been rejected.                |

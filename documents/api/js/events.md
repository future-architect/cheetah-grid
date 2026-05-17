---
url: /cheetah-grid/documents/api/js/events.md
---

# Events

You can set an event listener using the `listen(type, listener)` method.

Please get the event type from [`cheetahGrid.ListGrid.EVENT_TYPE`](https://future-architect.github.io/cheetah-grid/documents/tsdoc/interfaces/listgidevents.html).

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

| Event Name                                  | Description                                                      |
| :------------------------------------------ | :--------------------------------------------------------------- |
| EVENT\_TYPE.CLICK\_CELL                       | Fires when the cell was clicked.                                 |
| EVENT\_TYPE.DBLCLICK\_CELL                    | Fires when the cell was double-clicked.                          |
| EVENT\_TYPE.DBLTAP\_CELL                      | Fires when the cell was double-taped.                            |
| EVENT\_TYPE.MOUSEDOWN\_CELL                   | Fires when pointing device button is pressed in a cell.          |
| EVENT\_TYPE.MOUSEUP\_CELL                     | Fires when pointing device button is released in a cell.         |
| EVENT\_TYPE.SELECTED\_CELL                    | Fires when the cell selection state has changed.                 |
| EVENT\_TYPE.KEYDOWN                          | Fires key-downed.                                                |
| EVENT\_TYPE.MOUSEMOVE\_CELL                   | TBA                                                              |
| EVENT\_TYPE.MOUSEENTER\_CELL                  | TBA                                                              |
| EVENT\_TYPE.MOUSELEAVE\_CELL                  | TBA                                                              |
| EVENT\_TYPE.MOUSEOVER\_CELL                   | TBA                                                              |
| EVENT\_TYPE.MOUSEOUT\_CELL                    | TBA                                                              |
| EVENT\_TYPE.CONTEXTMENU\_CELL                 | Fires when the user attempts to open a context menu in the cell. |
| EVENT\_TYPE.INPUT\_CELL                       | TBA                                                              |
| EVENT\_TYPE.PASTE\_CELL                       | TBA                                                              |
| EVENT\_TYPE.DELETE\_CELL                      | TBA                                                              |
| EVENT\_TYPE.EDITABLEINPUT\_CELL               | TBA                                                              |
| EVENT\_TYPE.MODIFY\_STATUS\_EDITABLEINPUT\_CELL | TBA                                                              |
| EVENT\_TYPE.RESIZE\_COLUMN                    | Fires when the column width has changed.                         |
| EVENT\_TYPE.SCROLL                           | Fires when scrolled.                                             |
| EVENT\_TYPE.FOCUS\_GRID                       | Fires when grid focus is activated.                              |
| EVENT\_TYPE.BLUR\_GRID                        | Fires when grid focus is inactivated.                            |
| EVENT\_TYPE.BEFORE\_CHANGE\_VALUE              | Notifies that before the cell value changes.                     |
| EVENT\_TYPE.CHANGED\_VALUE                    | Fires when the cell value was changed.                           |
| EVENT\_TYPE.CHANGED\_HEADER\_VALUE             | Fires when the header cell value was changed.                    |
| EVENT\_TYPE.REJECTED\_PASTE\_VALUES            | Notifies that the pasted value has been rejected.                |

---
order: 190
---

# Selection Property

You can get the area selected by the user from the `selection` property.

| Property           | Description                                                                                                            | Exp.                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `selection.select` | You can get the selection start position with Object. The `row` in the Object is the INDEX line containing the header. | `{"col": 0, "row": 0}`                                         |
| `selection.range`  | You can get the selection range with Object. The `row` in the Object is the INDEX line containing the header.          | `{"start": {"col": 0, "row": 0}, "end": {"col": 2, "row": 2}}` |

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
<button class="button">SHOW SELECTION</button>
<pre style="color: #fff" class="result"></pre>
```

```js
document.querySelector(".button").addEventListener("click", () => {
  const { select, range } = grid.selection;

  document.querySelector(".result").textContent = `
select:
---
${JSON.stringify(select, null, "  ")},
---

range:
---
${JSON.stringify(range, null, "  ")},
---`;
});

const lang =
  navigator.language || navigator.userLanguage || navigator.browserLanguage;
const records = generatePersons(100);
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    { field: "personid", caption: "ID", width: 100 },
    { field: "fname", caption: "First Name", width: 200 },
    { field: "lname", caption: "Last Name", width: 200 },
    { field: "email", caption: "Email", width: 250 },
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
```

</code-preview>

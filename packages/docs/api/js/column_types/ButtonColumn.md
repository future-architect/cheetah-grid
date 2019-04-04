---
order: 400
---

# ButtonColumn

Show the button.

## Constructor Properties

|Property|Description|
|---|---|
|`caption`|Define button caption.|

## Style Properties

|Property|Description|Default|
|---|---|---|
|`buttonBgColor`|define background color of botton.|resolve by the theme.|

In addition to this, the Standard styles is available.

- [Standard Column Style](../column_styles.md)

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector('.sample1'),
  header: [
    {
      caption: 'Button1',
      width: 180,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: 'FIXED LABEL',
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },

    {
      caption: 'Button2',
      field: 'buttonCaption', // Get caption of button from record
      width: 180,
      columnType: 'button',
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  {buttonCaption: 'BUTTON1'},
  {buttonCaption: 'BUTTON2'},
  {buttonCaption: 'BUTTON3'},
  {buttonCaption: 'BUTTON4'},
  {buttonCaption: 'BUTTON5'},
];
```

</code-preview>
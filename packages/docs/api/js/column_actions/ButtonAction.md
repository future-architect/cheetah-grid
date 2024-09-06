---
order: 200
---

# ButtonAction

Define the behavior when the button is clicked.

The specified method is executed after select the cell by clicking it and then push Enter.

You can control the property of `disabled` and `action` by manipulating the instance of `ButtonAction` class.  
You can also disable each record by specifying a function for the `disabled` property.

## Constructor Properties

| Property            | Description                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `action` (Required) | Defines the action to be taken when clicking or pressing the Enter or Space key.     |
| `disabled`          | Define a boolean or predicate to control disable. See also [the standard properties] |

[the standard properties]: ./standard-properties.md

## Properties

| Property   | Description                                                                          |
| ---------- | ------------------------------------------------------------------------------------ |
| `action`   | Defines the action to be taken when clicking or pressing the Enter or Space key.     |
| `disabled` | Define a boolean or predicate to control disable. See also [the standard properties] |

## Example

<code-preview>

```html
<div class="sample1 demo-grid small"></div>

<label>change disabled properties : </label>
<select class="sample1disabled">
  <option value="" selected="true">default</option>
  <option value="disabled">disabled = true</option>
</select>
<span class="sample1disabledmemo"></span><br />
<label>change action properties : </label>
<select class="sample1action">
  <option value="" selected="true">Show record</option>
  <option value="hello">Message 'Hello!'</option>
</select>
<span>Once you have changed, please try to click</span>
```

```js
const buttonAction = new cheetahGrid.columns.action.ButtonAction({
  action(rec) {
    alert(JSON.stringify(rec, null, "  "));
  },
});

const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      caption: "button",
      width: 180,
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "BUTTON",
      }),
      action: buttonAction,
    },
  ],
});
grid.records = [
  { no: 1 /* ・・・ */ },
  { no: 2 /* ・・・ */ },
  { no: 3 /* ・・・ */ },
];

document.querySelector(".sample1disabled").onchange = function () {
  //change disabled properties
  if (this.value === "disabled") {
    buttonAction.disabled = true;
    document.querySelector(".sample1disabledmemo").textContent =
      "It will not toggle and does not respond when hovering the mouse";
  } else {
    buttonAction.disabled = false;
    document.querySelector(".sample1disabledmemo").textContent = "default";
  }
};

document.querySelector(".sample1action").onchange = function () {
  //change action properties
  if (this.value === "hello") {
    buttonAction.action = () => {
      alert("Hello!");
    };
  } else {
    buttonAction.action = (rec) => {
      alert(JSON.stringify(rec, null, "  "));
    };
  }
};
```

</code-preview>

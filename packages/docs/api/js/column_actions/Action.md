---
order: 700
---

# Action

Define the behavior when the cell is clicked.

The specified method is executed after select the cell by clicking it and then push Enter.

You can control the property of `disabled` and `action` by manipulating the instance of `ButtonAction` class.  
You can also disable each record by specifying a function for the `disabled` property.

## Constructor Properties

| Property            | Description                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `action` (Required) | Defines the action to be taken when clicking or pressing the Enter or Space key.     |
| `disabled`          | Define a boolean or predicate to control disable. See also [the standard properties] |
| `area`              | Defines an actionable area within a cell. Set this property to a predicate.          |

[the standard properties]: ./standard-properties.md

## Properties

| Property   | Description                                                                          |
| ---------- | ------------------------------------------------------------------------------------ |
| `action`   | Defines the action to be taken when clicking or pressing the Enter or Space key.     |
| `disabled` | Define a boolean or predicate to control disable. See also [the standard properties] |
| `area`     | Defines an actionable area within a cell. Set this property to a predicate.          |

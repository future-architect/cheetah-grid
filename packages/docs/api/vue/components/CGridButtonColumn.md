---
sidebarDepth: 3
---

# CGridButtonColumn

Defines button column.

## Vue Template Structure

<code-preview>

```vue
<div class="demo-grid small">
  <c-grid
    :data="records"
    :frozen-col-count="1">
    <c-grid-button-column
      caption="FIXED LABEL"
      width="120"
      @click="onClickRecord"
    >
      Button1
    </c-grid-button-column>
    <c-grid-button-column
      field="buttonCaption"
      width="120"
      @click="onClickRecord"
    >
      Button2
    </c-grid-button-column>
  </c-grid>
</div>
```

```js
export default {
  data() {
    return {
      records: [
        {buttonCaption: 'BUTTON1'},
        {buttonCaption: 'BUTTON2'},
        {buttonCaption: 'BUTTON3'},
        {buttonCaption: 'BUTTON4'},
        {buttonCaption: 'BUTTON5'},
      ]
    }
  },
  methods: {
    onClickRecord(rec) { alert(JSON.stringify(rec)); }
  }
};
```

</code-preview>

## Slots

<!-- SLOT_DEFAULT_START -->

### `default` slot

Use this slot to set the header caption

<!-- SLOT_DEFAULT_END -->

## Properties

<!-- PROPS_TABLE_START -->

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| field | `object`&#124;`string`&#124;`function`  | Defines a column data field | `undefined` |
| width | `number`&#124;`string`  | Defines a default column width | `undefined` |
| min-width | `number`&#124;`string`  | Defines a column min width | `undefined` |
| max-width | `number`&#124;`string`  | Defines a column max width | `undefined` |
| column-style | `object`&#124;`string`&#124;`function`  | Defines a column style | `undefined` |
| caption | `string`  | Defines a button caption | `''` |
| disabled | `boolean`&#124;`function`  | Defines disabled | `false` |
| colspan | `number`&#124;`string`  | Defines the layout colspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| filter | `string`&#124;`function`  | Defines a vue filter name | `undefined` |
| header-action | `object`&#124;`string`&#124;`function`  | Defines a column header action | `undefined` |
| header-field | `string`  | Defines a column header data field | `undefined` |
| header-style | `object`&#124;`string`&#124;`function`  | Defines a column header style | `undefined` |
| header-type | `object`&#124;`string`&#124;`function`  | Defines a column header type | `undefined` |
| icon | `object`&#124;`string`&#124;`function`  | Defines an icon | `undefined` |
| message | `object`&#124;`string`&#124;`function`  | Defines a Message generation method | `undefined` |
| rowspan | `number`&#124;`string`  | Defines the layout rowspan.<br>This property can be used when defining in the `layout-header` and `layout-body` slots. | `undefined` |
| sort | `string`&#124;`function`&#124;`boolean`  | Defines a sort | `undefined` |

<!-- PROPS_TABLE_END -->

## Events

<!-- EVENTS_TABLE_START -->

| Name        | Description         |
|:------------|:--------------------|
| click | Fired when a click on cell. |

<!-- EVENTS_TABLE_END -->

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |

<!-- METHODS_TABLE_END -->

---
url: /cheetah-grid/documents/api/vue/components/CGrid.md
---

# CGrid

Defines the Grid.

## Vue Template Structure

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" :frozen-col-count="1">
      <!-- define checkbox -->
      <c-grid-check-column field="check" width="50" />
      <c-grid-column field="personid" width="85"> ID </c-grid-column>
      <!-- multiple header -->
      <c-grid-column-group caption="Name">
        <c-grid-input-column field="fname" width="20%" min-width="150">
          First Name
        </c-grid-input-column>
        <c-grid-input-column field="lname" width="20%" min-width="150">
          Last Name
        </c-grid-input-column>
      </c-grid-column-group>
      <!-- button -->
      <c-grid-button-column
        caption="SHOW REC"
        width="120"
        @click="onClickRecord"
      />
    </c-grid>
  </div>
</template>
<script>
export default {
  data() {
    return {
      records,
    };
  },
  methods: {
    onClickRecord(rec) {
      alert(JSON.stringify(rec));
    },
  },
};
</script>
```

## Slots

### `default` slot

Use this slot to set the simple header definition.\
The definition is set to `header` property described in [Define Headers and Columns](../../js/headers_columns.md)

### `layout-header` slot

Use this slot to set the layout header definition.\
Use this slot in combination with the `layout-body` slot.\
The definition is set to `layout.header` property described in [Advanced Layout](../advanced_layout/index.md).

### `layout-body` slot

Use this slot to set the layout body definition.\
Use this slot in combination with the `layout-header` slot.\
The definition is set to `layout.body` property described in [Advanced Layout](../advanced_layout/index.md).

## Properties

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| data | `Array`|`object`  | Defines a records or data source. | `undefined` |
| frozen-col-count | `number`|`string`  | Defines a frozen col Count | `0` |
| header-row-height | `number`|`Array`  | Defines the header row height(s) | `undefined` |
| allow-range-paste | `boolean`  | Allow pasting of range. | `undefined` |
| trim-on-paste | `boolean`  | Trim the pasted text on pasting. | `undefined` |
| default-row-height | `number`  | Default grid row height. | `undefined` |
| default-col-width | `number`  | Default grid col width. | `undefined` |
| filter | `function`  | Defines a records filter | `undefined` |
| font | `string`  | Default font. | `undefined` |
| underlay-background-color | `string`  | Underlay background color. | `undefined` |
| theme | `object`|`string`  | Defines the grid theme | `undefined` |
| move-cell-on-tab-key | `boolean`|`function`  | Specify `true` to enable cell movement by Tab key. You can also specify a function that determines which cell to move to. | `false` |
| move-cell-on-enter-key | `boolean`|`function`  | Specify `true` to enable cell movement by Enter key. You can also specify a function that determines which cell to move to. | `false` |
| delete-cell-value-on-del-key | `boolean`  | Specify `true` to enable enable deletion of cell values with the Del and BS keys. | `undefined` |
| select-all-on-ctrl-a-key | `boolean`  | Specify `true` to enable select all cells by Ctrl + A key. | `undefined` |
| disable-column-resize | `boolean`  | Specify `true` to disable column resizing | `undefined` |
| disabled | `boolean`  | Defines disabled | `undefined` |
| readonly | `boolean`  | Defines readonly | `undefined` |
| options | `object`  | Defines a raw options for Cheetah Grid | `undefined` |

## Examples of using Properties

### theme

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" :theme="userTheme">
      <!-- set theme -->
      <c-grid-check-column field="check" :width="50" />
      <c-grid-column field="personid" width="85">ID</c-grid-column>
      <c-grid-column-group caption="Name">
        <c-grid-input-column
          field="fname"
          width="20%"
          min-width="150"
          :sort="true"
          >First Name</c-grid-input-column
        >
        <c-grid-input-column
          field="lname"
          width="20%"
          min-width="150"
          :sort="true"
          >Last Name</c-grid-input-column
        >
      </c-grid-column-group>
      <c-grid-button-column
        caption="SHOW REC"
        width="120"
        @click="onClickRecord"
      />
    </c-grid>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      records,
      // you can set the theme name or object.
      // userTheme: 'BASIC',
      userTheme: {
        color: "#2c3e50",
        frozenRowsColor: "#2c3e50",
        frozenRowsBgColor: "#40b883",
        borderColor: "#35495e",
        frozenRowsBorderColor: "#35495e",
        checkbox: {
          checkBgColor: "#35495e",
          borderColor: "#35495e",
        },
        button: {
          color: "#FFF",
          bgColor: "#2c3e50",
        },
      },
    };
  },
  methods: {
    onClickRecord(rec) {
      alert(JSON.stringify(rec));
    },
  },
};
</script>
```

## Data

| Name        | Type | Initial Value | Description         |
|:------------|:-----|:--------------|:--------------------|
| headerValues | Map\<any, any> | `new Map()` | Header values. |

## Events

| Name        | Description         |
|:------------|:--------------------|
| click-cell | Click on cell. |
| dblclick-cell | Doubleclick on cell. |
| selected-cell | Selected cell. |
| paste-cell | Paste on cell. |
| changed-value | Changed value. |
| changed-header-value | Changed header value. |

and more.\
In addition to the above, you can also use event names emitted by ListGrid in kebab-case.\
Please see [JS API Events](../../js/events.md) for details.

:::tip
The events for which the column can be identified emit the same event to each column definition component.\
e.g. `<c-grid-column>`
:::

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" :frozen-col-count="1">
      <c-grid-column
        field="personid"
        width="85"
        @click-cell="onClickCell($event, 'ID')"
      >
        ID
      </c-grid-column>
      <c-grid-input-column
        field="fname"
        width="20%"
        @click-cell="onClickCell($event, 'First Name')"
      >
        First Name
      </c-grid-input-column>
      <c-grid-input-column
        field="lname"
        width="20%"
        @click-cell="onClickCell($event, 'Last Name')"
      >
        Last Name
      </c-grid-input-column>
    </c-grid>
  </div>
</template>
<script>
export default {
  data() {
    return {
      records,
    };
  },
  methods: {
    onClickCell(event, colName) {
      alert("Click at " + colName + ": $event=" + JSON.stringify(event));
    },
  },
};
</script>
```

## Methods

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |
| updateSize | --- | Apply the changed size. |
| updateScroll | --- | Apply the changed scroll size. |

[advanced layout]: ../../js/advanced_layout/index.md

[define headers and columns]: ../../js/headers_columns.md

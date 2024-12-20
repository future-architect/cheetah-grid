---
sidebarDepth: 3
---

# CGrid

Defines the Grid.

## Vue Template Structure

<code-preview>

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

</code-preview>

## Slots

<!-- SLOT_DEFAULT_START -->

### `default` slot

Use this slot to set the simple header definition.  
The definition is set to `header` property described in [Define Headers and Columns]

<!-- SLOT_DEFAULT_END -->

<!-- SLOT_LAYOUT-HEADER_START -->

### `layout-header` slot

Use this slot to set the layout header definition.  
Use this slot in combination with the `layout-body` slot.  
The definition is set to `layout.header` property described in [Advanced Layout].

<!-- SLOT_LAYOUT-HEADER_END -->

<!-- SLOT_LAYOUT-BODY_START -->

### `layout-body` slot

Use this slot to set the layout body definition.  
Use this slot in combination with the `layout-header` slot.  
The definition is set to `layout.body` property described in [Advanced Layout].

<!-- SLOT_LAYOUT-BODY_END -->

## Properties

<!-- PROPS_TABLE_START -->

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| data | `Array`&#124;`object`  | Defines a records or data source. | `undefined` |
| frozen-col-count | `number`&#124;`string`  | Defines a frozen col Count | `0` |
| header-row-height | `number`&#124;`Array`  | Defines the header row height(s) | `undefined` |
| allow-range-paste | `boolean`  | Allow pasting of range. | `undefined` |
| trim-on-paste | `boolean`  | Trim the pasted text on pasting. | `undefined` |
| default-row-height | `number`  | Default grid row height. | `undefined` |
| default-col-width | `number`  | Default grid col width. | `undefined` |
| filter | `function`  | Defines a records filter | `undefined` |
| font | `string`  | Default font. | `undefined` |
| underlay-background-color | `string`  | Underlay background color. | `undefined` |
| theme | `object`&#124;`string`  | Defines the grid theme | `undefined` |
| move-cell-on-tab-key | `boolean`&#124;`function`  | Specify `true` to enable cell movement by Tab key. You can also specify a function that determines which cell to move to. | `false` |
| move-cell-on-enter-key | `boolean`&#124;`function`  | Specify `true` to enable cell movement by Enter key. You can also specify a function that determines which cell to move to. | `false` |
| delete-cell-value-on-del-key | `boolean`  | Specify `true` to enable enable deletion of cell values with the Del and BS keys. | `undefined` |
| select-all-on-ctrl-a-key | `boolean`  | Specify `true` to enable select all cells by Ctrl + A key. | `undefined` |
| disable-column-resize | `boolean`  | Specify `true` to disable column resizing | `undefined` |
| disabled | `boolean`  | Defines disabled | `undefined` |
| readonly | `boolean`  | Defines readonly | `undefined` |
| options | `object`  | Defines a raw options for Cheetah Grid | `undefined` |

<!-- PROPS_TABLE_END -->

## Examples of using Properties

### theme

<code-preview>

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

</code-preview>

## Data

<!-- DATA_TABLE_START -->

| Name        | Type | Initial Value | Description         |
|:------------|:-----|:--------------|:--------------------|
| headerValues | Map<any, any> | `new Map()` | Header values. |

<!-- DATA_TABLE_END -->

## Events

<!-- EVENTS_TABLE_START -->

| Name        | Description         |
|:------------|:--------------------|
| click-cell | Click on cell. |
| dblclick-cell | Doubleclick on cell. |
| selected-cell | Selected cell. |
| paste-cell | Paste on cell. |
| changed-value | Changed value. |
| changed-header-value | Changed header value. |

<!-- EVENTS_TABLE_END -->

and more...

:::tip
The events for which the column can be identified emit the same event to each column definition component.  
e.g. `<c-grid-column>`
:::

<code-preview>

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

</code-preview>

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |
| updateSize | --- | Apply the changed size. |
| updateScroll | --- | Apply the changed scroll size. |

<!-- METHODS_TABLE_END -->

[advanced layout]: ../../js/advanced_layout/index.md
[define headers and columns]: ../../js/headers_columns.md

---
sidebarDepth: 3
---

# CGrid

Defines the Grid.

## Vue Template Structure

<code-preview>

```vue
<div class="demo-grid middle">
  <c-grid
    :data="records"
    :frozen-col-count="1">
    <!-- define checkbox -->
    <c-grid-check-column
      field="check"
      width="50" />
    <c-grid-column
      field="personid"
      width= "85"
    >
      ID
    </c-grid-column>
    <!-- multiple header -->
    <c-grid-column-group
      caption="Name">
      <c-grid-input-column
        field="fname"
        width="20%"
        min-width="150"
      >
        First Name
      </c-grid-input-column>
      <c-grid-input-column
        field="lname"
        width= "20%"
        min-width="150"
      >
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
```

```js
export default {
  data() {
    return {
      records
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

Use this slot to set the columns definition

<!-- SLOT_DEFAULT_END -->

## Properties

<!-- PROPS_TABLE_START -->

### Optional Properties

| Name        | Type    | Description         | Default  |
|:------------|:-------:|:--------------------|:---------|
| data | `Array`&#124;`Object`  | Defines a records or data source. | `undefined` |
| frozen-col-count | `Number`&#124;`String`  | Defines a frozen col Count | `0` |
| filter | `Function`  | Defines a records filter | `undefined` |
| theme | `Object`&#124;`String`  | Defines the grid theme | `undefined` |
| options | `Object`  | Defines a raw options for Cheetah Grid | `undefined` |

<!-- PROPS_TABLE_END -->

## Data

- `headerValues` 

**initial value:** `{}` 

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

## Methods

<!-- METHODS_TABLE_START -->

| Name        | Return Type | Description         |
|:------------|:------------|:--------------------|
| invalidate | --- | Redraws the whole grid. |
| updateSize | --- | Apply the changed size. |
| updateScroll | --- | Apply the changed scroll size. |

<!-- METHODS_TABLE_END -->

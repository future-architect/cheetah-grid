---
sidebarDepth: 3
---

# CGridLayoutRow

Defines layout row.  
Can be used in the `layout-header` slot and the `layout-body` slot of `CGrid`.

## Vue Template Structure

<code-preview>

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" :frozen-col-count="1">
      <template v-slot:layout-header>
        <!-- header line1 -->
        <c-grid-layout-row>
          <c-grid-header width="85" rowspan="2">ID</c-grid-header>
          <c-grid-header width="20%" min-width="150">
            First Name
          </c-grid-header>
        </c-grid-layout-row>
        <!-- header line2 -->
        <c-grid-layout-row>
          <c-grid-header width="20%" min-width="150"> Last Name </c-grid-header>
        </c-grid-layout-row>
      </template>
      <template v-slot:layout-body>
        <!-- line1 -->
        <c-grid-layout-row>
          <c-grid-column field="personid" width="85" rowspan="2" />
          <c-grid-input-column field="fname" />
        </c-grid-layout-row>
        <!-- line2 -->
        <c-grid-layout-row>
          <c-grid-input-column field="lname" />
        </c-grid-layout-row>
      </template>
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
};
</script>
```

</code-preview>

## Slots

<!-- SLOT_DEFAULT_START -->

### `default` slot

Use this slot to set the row layout definition

<!-- SLOT_DEFAULT_END -->

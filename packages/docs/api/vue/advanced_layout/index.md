---
order: 200
---

# Advanced Layout

You can use the `layout-header` slot and the `layout-body` slot to define advanced header and record layouts.

For example:

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
          <c-grid-header width="200" rowspan="2">Birthday</c-grid-header>
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
          <c-grid-column :field="getBirthday" rowspan="2" />
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
/*
  record object properties
  {
    personid: 'ID',
    fname: 'First Name',
    lname: 'Last Name',
    email: 'Email',
    birthday: 'birthday',
  }
 */
const records = generatePersons(100);

export default {
  data() {
    return {
      records,
    };
  },
  methods: {
    getBirthday(rec) {
      const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      return dateTimeFormat.format(rec.birthday);
    },
  },
};
</script>
```

</code-preview>

---
order: 100
---

# Define Headers and Columns

## Standard Column

You can define the behavior and appearance of columns and headers cells by defining `<c-grid-column>` in `slot` of `<c-grid>`.

<code-preview>

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" frozen-col-count="1">
      <c-grid-column field="personid" width="100"> ID </c-grid-column>
      <c-grid-column field="fname" width="200"> First Name </c-grid-column>
      <c-grid-column field="lname" width="200"> Last Name </c-grid-column>
      <c-grid-column :field="getBirthday" width="200"> Birthday </c-grid-column>
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

## Multiple Header

To use multiple header, define `<c-grid-column-group>`.

<code-preview>

```vue
<template>
  <div class="demo-grid middle">
    <c-grid :data="records" frozen-col-count="1">
      <c-grid-column field="personid" width="100"> ID </c-grid-column>
      <!-- multiple header -->
      <c-grid-column-group caption="Name">
        <c-grid-column field="fname" width="200"> First Name </c-grid-column>
        <c-grid-column field="lname" width="200"> Last Name </c-grid-column>
      </c-grid-column-group>
      <c-grid-column :field="getBirthday" width="200"> Birthday </c-grid-column>
    </c-grid>
  </div>
</template>
<script>
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

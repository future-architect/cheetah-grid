# API for Vue.js

## Available Vue Components

Please refer [Available Vue Components](./components/index.md)

## Template

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

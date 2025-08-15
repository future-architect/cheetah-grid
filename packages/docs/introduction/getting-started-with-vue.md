---
order: 20
---

# Getting Started with Vue.js

## Installation

### Via npm

[![npm](https://img.shields.io/npm/v/vue-cheetah-grid.svg)](https://www.npmjs.com/package/vue-cheetah-grid)

```bash
npm install -S vue-cheetah-grid
```

```js
import vueCheetahGrid from "vue-cheetah-grid";

app.use(vueCheetahGrid);
```

### Via CDN

[![npm](https://img.shields.io/npm/v/vue-cheetah-grid.svg)](https://www.npmjs.com/package/vue-cheetah-grid)

```html
<link rel="stylesheet" href="https://unpkg.com/cheetah-grid@2.1/main.css" />
<script src="https://unpkg.com/cheetah-grid@2.1"></script>
<script src="https://unpkg.com/vue-cheetah-grid@2.1"></script>
```

```js
app.use(vueCheetahGrid);
```

## Vue Instance & Template

Please refer to the [more documents](../api/vue/index.md) for details

<code-preview>

```vue
<template>
  <div style="height: 500px; border: solid 1px #ddd;">
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
  <div class="grid-sample"></div>
</template>
<script>
export default {
  data() {
    return {
      records: generatePersons(1000),
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

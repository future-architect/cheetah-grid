# vue-cheetah-grid(beta)


[![npm](https://img.shields.io/npm/l/vue-cheetah-grid.svg)](https://www.npmjs.com/package/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/v/vue-cheetah-grid.svg)](https://www.npmjs.com/package/vue-cheetah-grid)
[![npm](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&prefix=&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/vue-cheetah-grid&maxAge=3600)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dw/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dm/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dy/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dt/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![Build Status](https://travis-ci.org/ota-meshi/vue-cheetah-grid.svg?branch=master)](https://travis-ci.org/ota-meshi/vue-cheetah-grid)  
[![NPM](https://nodei.co/npm/vue-cheetah-grid.png?downloads=true&stars=true)](https://www.npmjs.com/package/vue-cheetah-grid)  

## example

### `<template>`

```vue
<template>
  <c-grid
    ref="grid"
    :data="data"
    :frozen-col-count="1">
    <c-grid-column
      :width="50"
      field="check"
      column-type="check"
      action="check" />
    <c-grid-column
      field="personid"
      width= "85">
      ID
    </c-grid-column>
  </c-grid>
</template>
```

### `<script>` use global

```js
import CGrid from 'vue-cheetah-grid'

Vue.use(CGrid)
```

### `<script>` use local

```vue
<script>
import * as cGridAll from 'vue-cheetah-grid'

export default {
  name: 'App',
  components: {
    ...cGridAll
  },
  // ...
}
</script>
```

# Cheetah Grid - Vue Component

[![GitHub](https://img.shields.io/github/license/future-architect/cheetah-grid.svg)](https://github.com/future-architect/cheetah-grid)
[![npm](https://img.shields.io/npm/v/vue-cheetah-grid.svg)](https://www.npmjs.com/package/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dw/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dm/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dy/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dt/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![Build Status](https://travis-ci.org/future-architect/cheetah-grid.svg?branch=master)](https://travis-ci.org/future-architect/cheetah-grid)  
[![NPM](https://nodei.co/npm/vue-cheetah-grid.png?downloads=true&stars=true)](https://www.npmjs.com/package/vue-cheetah-grid)  

## Install using npm

```sh
$ npm install cheetah-grid vue-cheetah-grid
```

## Usage Examples

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
      width= "85"
    >
      ID
    </c-grid-column>
    <c-grid-column-group
      caption="Name">
      <c-grid-input-column
        field= "fname"
        width= "20%"
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
    <c-grid-button-column
      caption="SHOW REC"
      width="120"
      @click="onClickRecord"
    />
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

Please refer to the [documents](https://future-architect.github.io/cheetah-grid/) for details

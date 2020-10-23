# Cheetah Grid - Vue Component

[![GitHub](https://img.shields.io/github/license/future-architect/cheetah-grid.svg)](https://github.com/future-architect/cheetah-grid)
[![npm](https://img.shields.io/npm/v/vue-cheetah-grid.svg)](https://www.npmjs.com/package/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dw/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dm/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dy/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![npm](https://img.shields.io/npm/dt/vue-cheetah-grid.svg)](http://www.npmtrends.com/vue-cheetah-grid)
[![Build Status](https://github.com/future-architect/cheetah-grid/workflows/CI/badge.svg?branch=master)](https://github.com/future-architect/cheetah-grid/actions?query=workflow%3ACI)
[![NPM](https://nodei.co/npm/vue-cheetah-grid.png?downloads=true&stars=true)](https://www.npmjs.com/package/vue-cheetah-grid)  

## Install using npm

```sh
npm install -S vue-cheetah-grid
```

## Usage Examples

### `<template>`

```html
<template>
  <c-grid
    :data="records"
    :frozen-col-count="1">
    <!-- define checkbox -->
    <c-grid-check-column
      field="check"
      width="50">
    </c-grid-check-column>
    <c-grid-column
      field="personid"
      width="85"
    >
      ID
    </c-grid-column>
    <!-- multiple headers -->
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
        width="20%"
        min-width="150"
      >
        Last Name
      </c-grid-input-column>
    </c-grid-column-group>
    <!-- define button -->
    <c-grid-button-column
      caption="SHOW REC"
      width="120"
      @click="onClickRecord">
    </c-grid-button-column>
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

### Available `Vue Component` tag names

| Component Tag Name                     | Function                                                     | Note                                                 |
| -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `<c-grid>`                             | Grid                                                         | ---                                                  |
| `<c-grid-column>`                      | Column definition to display in the grid                     | ---                                                  |
| `<c-grid-column-group>`                | Definition of column group when multiple header is displayed | ---                                                  |
| `<c-grid-button-column>`               | Button column definition                                     | component for button column definition               |
| `<c-grid-check-column>`                | Checkbox column definition                                   | component for checkbox column definition             |
| `<c-grid-input-column>`                | Input column definition                                      | component for input column definition                |
| `<c-grid-menu-column>`                 | Menu column definition                                       | component for menu column definition                 |
| `<c-grid-link-column>`                 | Link column definition                                       | component for linkable column definition             |
| `<c-grid-icon-column>`                 | Icon column definition                                       | component for icon column definition                 |
| `<c-grid-percent-complete-bar-column>` | Percent complete bar column definition                       | component for Percent complete bar column definition |

Please refer also to the [Available Vue Components](https://future-architect.github.io/cheetah-grid/documents/api/vue/components/)

---

Please refer to the [documents](https://future-architect.github.io/cheetah-grid/) for details

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

# Cheetah Grid

[![npm](https://img.shields.io/npm/l/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/dm/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

<img src="https://future-architect.github.io/cheetah-grid/logo.png" style="max-width: 600px;" alt="Cheetah Grid" />

The fastest open-source web component of data table.

[![capture.png](https://github.com/future-architect/cheetah-grid/raw/master/images/capture.png)](https://future-architect.github.io/cheetah-grid/)

[DEMO & Documents](https://future-architect.github.io/cheetah-grid/)

## Downloading Cheetah Grid 

### Using Cheetah Grid with a CDN

```html
<script src="https://unpkg.com/cheetah-grid@0.0.1"></script>
```

### Downloading Cheetah Grid using npm
[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

```sh
$ npm install cheetah-grid
```

```js
const cheetahGrid = require("cheetah-grid")
```

### Downloading Cheetah Grid source code

[cheetahGrid.es5.min.js](https://unpkg.com/cheetah-grid@0.0.1/dist/cheetahGrid.es5.min.js)  

SourceMap  
[cheetahGrid.es5.min.js.map](https://unpkg.com/cheetah-grid@0.0.1/dist/cheetahGrid.es5.min.js.map)  

## Usage

```js
        grid = new cheetahGrid.ListGrid({
            // Parent element on which to place the grid
            parentElement: document.querySelector('#parent'),
            // Header definition
            header: [
                {field: 'check', caption: '', width: 50, columnType: 'check', action: 'check'},
                {field: 'personid', caption: 'ID', width: 100, columnType: 'center'},
                {field: 'fname', caption: 'First Name', width: 200},
                {field: 'lname', caption: 'Last Name', width: 200},
                {field: 'email', caption: 'Email', width: 250},
            ],
            // Array data to be displayed on the grid
            records,
            // Column fixed position
            frozenColCount: 2,
        });
```

Please refer to the [documents](https://future-architect.github.io/cheetah-grid/) for details


# Cheetah Grid

[![npm](https://img.shields.io/npm/l/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&prefix=&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/cheetah-grid&maxAge=3600)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/dw/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/dm/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/dy/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![npm](https://img.shields.io/npm/dt/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)
[![Build Status](https://travis-ci.org/future-architect/cheetah-grid.svg?branch=master)](https://travis-ci.org/future-architect/cheetah-grid)  
[![NPM](https://nodei.co/npm/cheetah-grid.png?downloads=true&stars=true)](https://www.npmjs.com/package/cheetah-grid)

[![Cheetah Grid](https://future-architect.github.io/cheetah-grid/logo.png)](https://future-architect.github.io/cheetah-grid/)  

The fastest open-source web component of data table.

[![capture.png](https://github.com/future-architect/cheetah-grid/raw/master/images/capture.png)](https://future-architect.github.io/cheetah-grid/)

[DEMO & Documents](https://future-architect.github.io/cheetah-grid/)

## Downloading Cheetah Grid 

### Using Cheetah Grid with a CDN
[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

```html
<script src="https://unpkg.com/cheetah-grid@0.4.x"></script>
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
[![npm](https://img.shields.io/npm/v/cheetah-grid.svg)](https://www.npmjs.com/package/cheetah-grid)

[cheetahGrid.es5.min.js](https://unpkg.com/cheetah-grid@0.4.x/dist/cheetahGrid.es5.min.js)  

SourceMap  
[cheetahGrid.es5.min.js.map](https://unpkg.com/cheetah-grid@0.4.x/dist/cheetahGrid.es5.min.js.map)  


### Downloading Cheetah Grid using GitHub
[![GitHub package version](https://img.shields.io/github/package-json/v/future-architect/cheetah-grid.svg)](https://github.com/future-architect/cheetah-grid)

#### git clone
```bash
$ git clone https://github.com/future-architect/cheetah-grid.git
```

#### npm install & build
```bash
$ npm install
$ npm run build
```

built file is created in the `./dist` directory

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


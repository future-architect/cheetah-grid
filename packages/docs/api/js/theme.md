---
order: 250
---

# Theme

Can set theme to Cheetah Grid.  
Can settings for grid instance or global.

## Grid instance

Set a theme to the `theme` property of the grid instance.  
Built-in themes are `MATERIAL_DESIGN` and `BASIC`.

<code-preview :data="{createGrid}">

```html
<label>theme</label>
<select class="theme-select1">
    <option value="" selected="true">unset</option>
    <option value="MATERIAL_DESIGN">MATERIAL_DESIGN</option>
    <option value="BASIC">BASIC</option>
</select>
<div class="sample1 demo-grid small"></div>
```

```js
const grid = vm.createGrid(document.querySelector('.sample1'));

const themeSelect = document.querySelector('.theme-select1');
themeSelect.onchange = function() {
  grid.theme = cheetahGrid.themes.choices[themeSelect.value];

  /* The `theme` property of the grid instance can also be set as a string. */
  // grid.theme = themeSelect.value;
};
themeSelect.onchange();
```

</code-preview>

## Global

Set a theme to the `cheetahGrid.themes.default` property.
(default MATERIAL_DESIGN.)

<code-preview :data="{createGrid,girdInstances}">

```html
<label>theme</label>
<select class="theme-select2">
    <option value="MATERIAL_DESIGN" selected="true">MATERIAL_DESIGN</option>
    <option value="BASIC">BASIC</option>
</select>
<div class="sample2 demo-grid small"></div>
```

```js
vm.createGrid(document.querySelector('.sample2'));

const themeSelect = document.querySelector('.theme-select2');
themeSelect.onchange = function() {
  cheetahGrid.themes.default = cheetahGrid.themes.choices[themeSelect.value];

  // redraw all the grids
  vm.girdInstances.forEach((grid) => grid.invalidate());
};

themeSelect.onchange();
```

</code-preview>

## Extend theme

To extend the theme, do as follows.

<code-preview :data="{createGrid}">

```html
<div class="sample3 demo-grid small"></div>
```

```js
const grid = vm.createGrid(document.querySelector('.sample3'));

const userTheme = {
  color: 'red',
  frozenRowsColor: 'red',
  defaultBgColor: '#FDD',
  frozenRowsBgColor: '#EAA',
  selectionBgColor: '#FDA',
  underlayBackgroundColor: '#FEE',
  // You can also change the theme apply in the state by using callback.
  frozenRowsBorderColor(args) {
    const {
      row,
      grid: {frozenRowCount}
    } = args;
    if (frozenRowCount - 1 === row) {
      return ['#F88'/*top*/, '#F88'/*right and left*/, 'red'/*bottom*/];
    } else {
      return '#F88';
    }
  },
  borderColor(args) {
    const {
      col,
      grid: {colCount}
    } = args;
    if (colCount - 1 === col) {
      return ['red'/*top*/, '#F88'/*right*/, 'red'/*bottom*/, null/*left*/];
    } else {
      return ['red'/*top and bottom*/, null/*right and left*/];
    }
  },
  highlightBorderColor: '#FD5',
  checkbox: {
    uncheckBgColor: '#FDD',
    checkBgColor: 'rgb(255, 73, 72)',
    borderColor: 'red',
  },
  button: {
    color: '#FDD',
    bgColor: '#F55',
  },
  font: '16px sans-serif',
  header: {
    sortArrowColor: '#D00'
  }
};
grid.theme = userTheme;
```

</code-preview>

## Vue component

In the Vue component, set it as follows.

<code-preview :data="{createGrid}">

```vue
<div class="demo-grid middle">
  <c-grid
    :data="records"
    :theme="userTheme"> <!-- set theme -->
    <c-grid-check-column field="check" :width="50"/>
    <c-grid-column field="personid" width= "85">ID</c-grid-column>
    <c-grid-column-group caption="Name">
      <c-grid-input-column field="fname" width="20%" min-width="150" :sort="true">First Name</c-grid-input-column>
      <c-grid-input-column field="lname" width="20%" min-width="150" :sort="true">Last Name</c-grid-input-column>
    </c-grid-column-group>
    <c-grid-button-column caption="SHOW REC" width="120" @click="onClickRecord" />
  </c-grid>
</div>
```

```js
export default {
  name: 'App',
  data() {
    return {
      records,
      // you can set the theme name or object.
      // userTheme: 'BASIC',
      userTheme: {
        color: '#2c3e50',
        frozenRowsColor: '#2c3e50',
        frozenRowsBgColor: '#40b883',
        borderColor: '#35495e',
        frozenRowsBorderColor: '#35495e',
        checkbox: {
          checkBgColor: '#35495e',
          borderColor: '#35495e',
        },
        button: {
          color: '#FFF',
          bgColor: '#2c3e50',
        },
      }
    };
  },
  methods: {
    onClickRecord(rec) { alert(JSON.stringify(rec)); }
  }
};
```

</code-preview>

<script>
const girdInstances = [];
function createGrid(parentElement) {
  const records = generatePersons(100);

  const grid = new cheetahGrid.ListGrid({
    parentElement,
    header: [
      {field: 'check', caption: '', width: 50, columnType: 'check', action: 'check'},
      {field: 'personid', caption: 'ID', width: 100},
      { /* multiple header */
        caption: 'name',
        columns: [
          {field: 'fname', caption: 'First Name', width: 200, sort: true},
          {field: 'lname', caption: 'Last Name', width: 200, sort: true},
        ],
      },
      {field: 'email', caption: 'Email', width: 250, sort: true},
      {
      /* callback field */
        field(rec) {
          const d = rec.birthday;
          return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        },
        caption: 'birthday',
        width: 100
      },
      {
        caption: 'button',
        width: 120,
        /* button column */
        columnType: new cheetahGrid.columns.type.ButtonColumn({
          caption: 'SHOW REC',
        }),
        action: new cheetahGrid.columns.action.ButtonAction({
          action(rec) {
            alert(JSON.stringify(rec));
          },
        }),
      }
    ],
    frozenColCount: 2,
    records
  });
  girdInstances.push(grid);
  return grid;
}
export default {
  data () {
    return {
      createGrid,
      girdInstances
    }
  },
  beforeDestroy() {
    cheetahGrid.themes.default = 'MATERIAL_DESIGN';
  },
}
</script>
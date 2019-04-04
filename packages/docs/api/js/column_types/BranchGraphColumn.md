---
order: 900
---

# BranchGraphColumn

Show branch graph.

## Constructor Properties

|Property|Description|Default|
|---|---|---|
|`start`|set the moving direction by setting the beggining point. `'top'` or `'bottom'`|`'bottom'`|
|`cache`|set `true` when caching the calculation result of the branch structure. Please call `clearCache(grid)` when deleting the cahced data.|`false`|

### Style Properties

|Property|Description|Default|
|---|---|---|
|`branchColors`|set the function which returns the color of branch you want to use. arguments: (branch name, `index`)|the function which returns following colors in turn. `'#979797'`,`'#008fb5'`,`'#f1c109'`|
|`margin`|set the margin of side.|`4`|
|`circleSize`|set the size of point which express `commit`.|`16`|
|`branchLineWidth`|set the width of branch lines.|`4`|
|`mergeStyle`|set the way to express the merge line. `'bezier'` or `'straight'`|`'bezier'`|

<code-preview>

```html
<div class="sample1 demo-grid large"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector('.sample1'),
  header: [
    {
      field: (rec) => rec,
      caption: 'BranchGraph',
      width: 200,
      columnType: new cheetahGrid.columns.type.BranchGraphColumn({
        start: 'top', // Specify the start and indicate the direction to proceed. 'top' or 'bottom'. default 'bottom'
        cache: false // cache enable. default false
      }),
    },
    {
      field(rec) {
        return `${JSON.stringify(rec)},`;
      },
      caption: 'command',
      width: 1000
    },
  ],
  frozenColCount: 1
});
grid.records = [

  [
    // new branch 'mastar'
    {
      command: 'branch',
      branch: 'mastar'
    },
    // and commit 'mastar' branch
    {
      command: 'commit',
      branch: 'mastar'
    }
  ],
  [
    // commit 'mastar' branch
    {
      command: 'commit',
      branch: 'mastar'
    },
  ],
  [
    // new branch 'develop'. from 'mastar'
    {
      command: 'branch',
      branch: {
        from: 'mastar',
        to: 'develop'
      }
    },
  ],
  [
    // commit 'develop' branch
    {
      command: 'commit',
      branch: 'develop'
    },
  ],
  [
    // merge 'develop' branch into 'master' branch
    {
      command: 'merge',
      branch: {
        from: 'develop',
        to: 'mastar'
      }
    },
    // and tag with v.0.0.1
    {
      command: 'tag',
      branch: 'mastar',
      tag: 'v1.0.0'
    },
  ],
  [
    null // not doing
  ],
  //-------------------------
  [
    {
      command: 'branch',
      branch: {
        from: 'develop',
        to: 'develop2'
      }
    }, {
      command: 'commit',
      branch: 'develop2'
    }
  ],
  [
    {
      command: 'branch',
      branch: {
        from: 'develop',
        to: 'develop3'
      }
    }, {
      command: 'commit',
      branch: 'develop3'
    },
    {
      command: 'merge',
      branch: {
        from: 'develop2',
        to: 'mastar'
      }
    },
  ],
  [
    {
      command: 'commit',
      branch: 'develop2'
    }
  ],
  [
    {
      command: 'branch',
      branch: {
        from: 'develop2',
        to: 'develop4'
      }
    }, {
      command: 'commit',
      branch: 'develop4'
    },
    {
      command: 'branch',
      branch: {
        from: 'develop2',
        to: 'develop5'
      }
    }, {
      command: 'commit',
      branch: 'develop5'
    },
  ],
  [
    {
      command: 'commit',
      branch: 'develop2'
    }
  ],
  [
    {
      command: 'tag',
      branch: 'mastar',
      tag: 'v1.1.0'
    },
    {
      command: 'commit',
      branch: 'mastar'
    },
    {
      command: 'commit',
      branch: 'develop4'
    }
  ],
  {
    command: 'commit',
    branch: 'develop3'
  }
];
```

</code-preview>

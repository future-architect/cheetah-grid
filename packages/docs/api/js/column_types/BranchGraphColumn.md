---
order: 900
---

# BranchGraphColumn

Show branch graph.

## Constructor Properties

| Property | Description                                                                                                                           | Default    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `start`  | Set the moving direction by setting the beginning point. `'top'` or `'bottom'`                                                        | `'bottom'` |
| `cache`  | Set `true` when caching the calculation result of the branch structure. Please call `clearCache(grid)` when deleting the cached data. | `false`    |

## Style Properties

| Property          | Description                                                                                           | Default                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `branchColors`    | Set the function which returns the color of branch you want to use. arguments: (branch name, `index`) | the function which returns following colors in turn. `'#979797'`,`'#008fb5'`,`'#f1c109'` |
| `margin`          | Set the margin of side.                                                                               | `4`                                                                                      |
| `circleSize`      | Set the size of point which express `commit`.                                                         | `16`                                                                                     |
| `branchLineWidth` | Set the width of branch lines.                                                                        | `4`                                                                                      |
| `mergeStyle`      | Set the way to express the merge line. `'bezier'` or `'straight'`                                     | `'bezier'`                                                                               |

## Data Format

The value provided from each record through the field must be an object or an array of it in the following format.

### Branch Command

This is the command to create a new branch.\
It is an object with the following properties:

| Property               | Description                                                                                 |
| :--------------------- | :------------------------------------------------------------------------------------------ |
| `command` (Required)   | Sets `"branch"`, which indicates what command the object is directing.                      |
| `branch`               | Set the value of the branch name to operate on.                                             |
| `branch.to` (Required) | Set the name of the new branch to be created. Set `branch` to a string has the same effect. |
| `branch.from`          | Set the branch name to be branched from.                                                    |

### Commit Command

This is the command to commit a branch.\
It is an object with the following properties:

| Property             | Description                                                            |
| :------------------- | :--------------------------------------------------------------------- |
| `command` (Required) | Sets `"commit"`, which indicates what command the object is directing. |
| `branch` (Required)  | Set the value of the branch name to operate on.                        |

### Merge Command

This is the command to merge a branch into a branch.\
It is an object with the following properties:

| Property                 | Description                                                           |
| :----------------------- | :-------------------------------------------------------------------- |
| `command` (Required)     | Sets `"merge"`, which indicates what command the object is directing. |
| `branch` (Required)      | Set the value of the branch name to operate on.                       |
| `branch.to` (Required)   | Sets the name of the branch that will be merged.                      |
| `branch.from` (Required) | Sets the name of the branch you want to merge from.                   |

### Tag Command

This is the command to create a tag.\
It is an object with the following properties:

| Property             | Description                                                         |
| :------------------- | :------------------------------------------------------------------ |
| `command` (Required) | Sets `"tag"`, which indicates what command the object is directing. |
| `branch` (Required)  | Set the value of the branch name to operate on.                     |
| `tag` (Required)     | Set the name of the new tag to be created.                          |

## Instance Methods

### `clearCache(grid)`

Clear the cache.

| Parameter | Description                               |
| :-------- | :---------------------------------------- |
| `grid`    | It should be given an instance of a grid. |

## Example

<code-preview>

```html
<div class="sample1 demo-grid large"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: (rec) => rec,
      caption: "BranchGraph",
      width: 200,
      columnType: new cheetahGrid.columns.type.BranchGraphColumn({
        start: "top", // Specify the start and indicate the direction to proceed. 'top' or 'bottom'. default 'bottom'
        cache: false, // cache enable. default false
      }),
    },
    {
      field(rec) {
        return `${JSON.stringify(rec)},`;
      },
      caption: "command",
      width: 1000,
    },
  ],
  frozenColCount: 1,
});
grid.records = [
  [
    // new branch 'mastar'
    {
      command: "branch",
      branch: "mastar",
    },
    // and commit 'mastar' branch
    {
      command: "commit",
      branch: "mastar",
    },
  ],
  [
    // commit 'mastar' branch
    {
      command: "commit",
      branch: "mastar",
    },
  ],
  [
    // new branch 'develop'. from 'mastar'
    {
      command: "branch",
      branch: {
        from: "mastar",
        to: "develop",
      },
    },
  ],
  [
    // commit 'develop' branch
    {
      command: "commit",
      branch: "develop",
    },
  ],
  [
    // merge 'develop' branch into 'master' branch
    {
      command: "merge",
      branch: {
        from: "develop",
        to: "mastar",
      },
    },
    // and tag with v.0.0.1
    {
      command: "tag",
      branch: "mastar",
      tag: "v1.0.0",
    },
  ],
  [
    null, // not doing
  ],
  //-------------------------
  [
    {
      command: "branch",
      branch: {
        from: "develop",
        to: "develop2",
      },
    },
    {
      command: "commit",
      branch: "develop2",
    },
  ],
  [
    {
      command: "branch",
      branch: {
        from: "develop",
        to: "develop3",
      },
    },
    {
      command: "commit",
      branch: "develop3",
    },
    {
      command: "merge",
      branch: {
        from: "develop2",
        to: "mastar",
      },
    },
  ],
  [
    {
      command: "commit",
      branch: "develop2",
    },
  ],
  [
    {
      command: "branch",
      branch: {
        from: "develop2",
        to: "develop4",
      },
    },
    {
      command: "commit",
      branch: "develop4",
    },
    {
      command: "branch",
      branch: {
        from: "develop2",
        to: "develop5",
      },
    },
    {
      command: "commit",
      branch: "develop5",
    },
  ],
  [
    {
      command: "commit",
      branch: "develop2",
    },
  ],
  [
    {
      command: "tag",
      branch: "mastar",
      tag: "v1.1.0",
    },
    {
      command: "commit",
      branch: "mastar",
    },
    {
      command: "commit",
      branch: "develop4",
    },
  ],
  {
    command: "commit",
    branch: "develop3",
  },
];
```

</code-preview>

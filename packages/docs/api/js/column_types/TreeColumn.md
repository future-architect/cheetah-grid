---
order: 1010
---

# TreeColumn

Show a hierarchical tree.

TreeColumn class does not have the feature to open and close branch nodes, you must implement it yourself if you need it.

## Constructor Properties

| Property | Description                                                                                                                           | Default |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `cache`  | Set `true` when caching the calculation result of the branch structure. Please call `clearCache(grid)` when deleting the cached data. | `false` |

## Style Properties

| Property       | Description                                                                                                     | Default               |
| -------------- | --------------------------------------------------------------------------------------------------------------- | --------------------- |
| `lineColor`    | Sets the tree lines color.                                                                                      | Resolve by the theme. |
| `lineStyle`    | Sets the tree lines style. Allowed values ​​are `'none'` or `'solid'`                                           | Resolve by the theme. |
| `lineWidth`    | Sets the with of of the tree lines.                                                                             | Resolve by the theme. |
| `treeIcon`     | Sets the icon to display on the node tree. Allowed values ​​are `"chevron_right"`, `"expand_more"` or `"none"`. | Resolve by the theme. |
| `textAlign`    | Define the horizontal position of text in cell.                                                                 | `'left'`              |
| `textBaseline` | Define the vertical position of text in cell.                                                                   | `'middle'`            |
| `color`        | Define the color of cell.                                                                                       | Resolve by the theme. |
| `font`         | Define the font of cell.                                                                                        | --                    |
| `padding`      | Define the padding of cell. If you set 4 values separately, please set the `Array`.                             | --                    |
| `textOverflow` | Define how to display when text overflows the area of a cell. `clip` or `ellipsis` is available.                | `'clip'`              |

In addition to this, the Standard styles is available.

- [Standard Column Style](../column_styles/index.md)

## Data Format

The value provided from each record through the field must be an object of the format described below.

The object has the following properties:

| Property          | Description                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path` (Required) | An array of path indicating the hierarchy. See [the `path` description section](#path) for more information.                                                   |
| `caption`         | The caption of the record. If not specified, the last value of the path will be used as the caption.                                                           |
| `nodeType`        | Set to `"leaf"` or `"branch"`. Set whether the node is a leaf node or a branch node. See [the `nodeType` description section](#nodetype) for more information. |

### `path`

This is a required property.\
This is an array of path indicating the hierarchy. The path must contain an element that identifies the node itself.

Example:

| Node          | `code` | `path` Value       |
| :------------ | :----- | :----------------- |
| `Grandparent` | `'g'`  | `['g']`            |
| `├ Parent`    | `'p'`  | `['g', 'p']`       |
| `│└ Child1`   | `'c1'` | `['g', 'p', 'c1']` |
| `└ Child2`    | `'c2'` | `['g', 'c2']`      |

### `nodeType`

Set to `"leaf"` or `"branch"`.
Set whether the node is a leaf node (`"leaf"`) or a branch node (`"branch"`).
Use this to display an icon if the node does not display any child nodes in the display.
If the child nodes are displayed, they are forced to be treated as branch nodes.

## Instance Methods

### `drawnIconActionArea(params)`

A predicate that makes the icon an actionable area of ​​[the `Action` class]. Use it for the `area` property of ​​[the `Action` class].

| Parameter | Description                                                                 |
| :-------- | :-------------------------------------------------------------------------- |
| `params`  | It's a parameter passed from the `area` property of ​​[the `Action` class]. |

[the `action` class]: ../column_actions/Action.md

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
const expands = { p1: true };

const tree = [
  {
    code: "p1",
    children: [
      {
        code: "c1_1",
        children: [
          {
            code: "d1_1_1",
          },
          {
            code: "d1_1_2",
            children: [
              {
                code: "e1_1_2_1",
              },
              {
                code: "e1_1_2_2",
              },
            ],
          },
        ],
      },
      {
        code: "c1_2",
      },
    ],
  },
  {
    code: "p2",
    children: [
      {
        code: "c2_1",
      },
      {
        code: "c2_2",
      },
    ],
  },
];

// Set the parent property to the parent node so that we can keep track of the parent node.
const buffer = [...tree];
while (buffer.length) {
  const node = buffer.shift();
  for (const child of node.children || []) {
    child.parent = node;
    buffer.push(child);
  }
}

/** Gets the specified node and its ancestor nodes. */
function* ancestors(node) {
  let n = node;
  while (n) {
    yield n;
    n = n.parent;
  }
}

const treeColumn = new cheetahGrid.columns.type.TreeColumn({
  cache: false, // cache enable. default false
});
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: (node) => {
        // Build tree data
        const hasChildren = !!node.children?.length;

        const path = [...ancestors(node)].reverse().map((node) => node.code);

        return {
          caption: node.code,
          /**
           * An array of paths indicating the hierarchy to the record.
           * The path must contain an element that identifies the node itself.
           */
          path,
          nodeType: hasChildren ? "branch" : "leaf",
        };
      },
      caption: "Tree",
      width: 200,
      columnType: treeColumn,
      action: new cheetahGrid.columns.action.Action({
        disabled: (node) => {
          const hasChildren = !!node.children?.length;
          return !hasChildren;
        },
        action: (node) => {
          expands[node.code] = !expands[node.code];
          grid.records = buildRecords(tree);
        },
        area: treeColumn.drawnIconActionArea,
      }),
    },
    {
      field: "code",
      caption: "Code",
      width: 200,
    },
    {
      field: (node) => {
        const path = [...ancestors(node)].reverse().map((node) => node.code);
        return "[" + path.join(", ") + "]";
      },
      caption: "Path",
      width: 300,
    },
  ],
  frozenColCount: 1,
});
grid.records = buildRecords(tree);

function buildRecords(nodes) {
  const records = [];
  for (const node of nodes) {
    records.push(node);
    if (expands[node.code]) {
      records.push(...buildRecords(node.children));
    }
  }
  return records;
}
```

</code-preview>

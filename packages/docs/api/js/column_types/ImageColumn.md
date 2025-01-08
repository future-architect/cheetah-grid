---
order: 500
---

# ImageColumn

## Draw image

Use `columnType: 'image'` to draw image in the cell.

<code-preview>

```html
<div class="sample1 demo-grid middle"></div>
```

> note: Images used in samples are on [wikipedia](https://en.wikipedia.org/wiki/Cheetah).
> Please click the images to check details of those.

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      field: "imageUrl",
      caption: "image",
      width: 100,
      columnType: "image",
      style: { imageSizing: "keep-aspect-ratio" },

      // open image detail
      action: new cheetahGrid.columns.action.Action({
        action(rec) {
          window.open(rec.link, "_blank");
        },
      }),
    },
    { field: "label", caption: "label", width: 200 },
  ],
  frozenColCount: 1,
  defaultRowHeight: 100,
  headerRowHeight: 24,
});
//https://en.wikipedia.org/wiki/Cheetah
grid.records = [
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Kooshki_%28Iranian_Cheetah%29_03.jpg/440px-Kooshki_%28Iranian_Cheetah%29_03.jpg",
    label: "Asiatic cheetah",
    link: "https://en.wikipedia.org/wiki/File:Kooshki_(Iranian_Cheetah)_03.jpg",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Cheetah_%28Kruger_National_Park%2C_South_Africa%2C_2001%29.jpg/180px-Cheetah_%28Kruger_National_Park%2C_South_Africa%2C_2001%29.jpg",
    label: "South African cheetah",
    link: "https://en.wikipedia.org/wiki/File:Cheetah_(Kruger_National_Park,_South_Africa,_2001).jpg",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Cheetah_at_Whipsnade_Zoo%2C_Dunstable.jpg/180px-Cheetah_at_Whipsnade_Zoo%2C_Dunstable.jpg",
    label: "Sudan cheetah",
    link: "https://en.wikipedia.org/wiki/File:Cheetah_at_Whipsnade_Zoo,_Dunstable.jpg",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/TanzanianCheetah.jpg/180px-TanzanianCheetah.jpg",
    label: "Tanzanian cheetah",
    link: "https://en.wikipedia.org/wiki/File:TanzanianCheetah.jpg",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Cheetah_portrait_Whipsnade_Zoo.jpg/220px-Cheetah_portrait_Whipsnade_Zoo.jpg",
    label: "Cheetah",
    link: "https://en.wikipedia.org/wiki/File:Cheetah_portrait_Whipsnade_Zoo.jpg",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/King_cheetah.jpg/170px-King_cheetah.jpg",
    label: "King cheetah",
    link: "https://en.wikipedia.org/wiki/File:King_cheetah.jpg",
  },
];
grid.configure("fadeinWhenCallbackInPromise", true);
```

</code-preview>

## Style Properties

| Property       | Description                                                                         | Default    |
| -------------- | ----------------------------------------------------------------------------------- | ---------- |
| `imageSizing`  | Defining "keep-aspect-ratio" will keep the aspect ratio.                            | --         |
| `margin`       | Define margin of image.                                                             | `4`        |
| `textAlign`    | Define horizontal position of image in cell.                                        | `'center'` |
| `textBaseline` | Define vertical position of image in cell.                                          | `'middle'` |
| `padding`      | Define the padding of cell. If you set 4 values separately, please set the `Array`. | --         |

In addition to this, the Standard styles is available.

- [Standard Column Style](../column_styles/index.md)

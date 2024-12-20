---
order: 310
---

# Define Column ICON

Use `icon` property when drawing icons.

You can use 2 types of icons below by setting.

- ICON by Web Font
- ICON by picture

## Standard way to specify Web Fonts

For standard Web font, you should set `font` and `content`.

<code-preview>

```html
<div class="sample1 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample1"),
  header: [
    {
      caption: "text",
      width: 180,
      icon: {
        font: "normal normal normal 14px/1 FontAwesome",
        content: "iconContent",
        width: 16, // Optional
      },
      field: "text",
    },

    {
      caption: "button",
      width: 180,
      icon: {
        font: "normal normal normal 14px/1 FontAwesome",
        content: "iconContent",
        width: 16, // Optional
      },
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "BUTTON",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  { text: "file", iconContent: "\uf15b" },
  { text: "audio", iconContent: "\uf1c7" },
  { text: "code", iconContent: "\uf1c9" },
  { text: "image", iconContent: "\uf1c5" },
];
```

<template v-slot:code-block>

> ICON in sample uses [Font Awesome Icons](http://fontawesome.io/icons/)
>
> ```html
> <!-- Font Awesome:  http://fontawesome.io -->
> <link
>   rel="stylesheet"
>   type="text/css"
>   href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
> />
> ```

</template>

</code-preview>

## Other ways to specify Web Font

You can use web font by setting `className`.

<code-preview>

```html
<div class="sample2 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample2"),
  header: [
    {
      caption: "text",
      width: 180,
      icon: {
        className: "iconClassName",
        width: 16, // Optional
      },
      field: "text",
    },

    {
      caption: "button",
      width: 180,
      icon: {
        className: "iconClassName",
        width: 16, // Optional
        color: "#fff", // Optional
      },
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "BUTTON",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  { text: "file", iconClassName: "fa fa-file" },
  { text: "audio", iconClassName: "fa fa-file-audio-o" },
  { text: "code", iconClassName: "fa fa-file-code-o" },
  { text: "image", iconClassName: "fa fa-file-image-o" },
];
```

</code-preview>

## How to specify Images

Set `src` to show pictures.

<code-preview>

```html
<div class="sample3 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample3"),
  header: [
    {
      caption: "OSS",
      width: 300,
      icon: {
        src: "iconSrc",
        width: 16,
      },
      field: "label",
    },
    {
      caption: "link",
      width: 150,
      icon: {
        src: "iconSrc",
        width: 16,
      },
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "LINK",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          window.open(rec.url, "_blank");
        },
      }),
    },
  ],
});
grid.records = [
  {
    label: "Vuls: VULnerability Scanner",
    iconSrc:
      "https://github.com/future-architect/vuls/raw/master/img/vuls_icon.png",
    url: "https://github.com/future-architect/vuls",
  },
  {
    label: "uroboroSQL",
    iconSrc: "https://future-architect.github.io/uroborosql-doc/favicon.ico",
    url: "https://future-architect.github.io/uroborosql-doc/",
  },
  {
    label: "Urushi",
    iconSrc:
      "http://future-architect.github.io/urushi/gh-pages-resoucres/favicon.ico",
    url: "http://future-architect.github.io/urushi/",
  },
];
```

</code-preview>

## Multiple Icons

Give array in order to show multiple icons.

<code-preview>

```html
<div class="sample4 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample4"),
  header: [
    {
      caption: "text",
      width: 180,
      icon: {
        font: "normal normal normal 14px/1 FontAwesome",
        content: "iconContent",
        width: 16, // Optional
      },
      field: "text",
    },

    {
      caption: "button",
      width: 180,
      icon: {
        font: "normal normal normal 14px/1 FontAwesome",
        content: "iconContent",
        width: 16, // Optional
      },
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "BUTTON",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          alert(JSON.stringify(rec));
        },
      }),
    },
  ],
});
grid.records = [
  { text: "files", iconContent: ["\uf15b", "\uf1c7", "\uf1c9", "\uf1c5"] },
  { text: "forms", iconContent: ["\uf046", "\uf192", "\uf0fe", "\uf147"] },
  { text: "charts", iconContent: ["\uf1fe", "\uf080", "\uf200"] },
];
```

</code-preview>

<code-preview>

```html
<div class="sample5 demo-grid small"></div>
```

```js
const grid = new cheetahGrid.ListGrid({
  parentElement: document.querySelector(".sample5"),
  header: [
    {
      caption: "OSS",
      width: 300,
      icon: {
        src: "iconSrc",
        width: 16,
      },
      field: "label",
    },
    {
      caption: "link",
      width: 150,
      icon: {
        src: "iconSrc",
        width: 16,
      },
      columnType: new cheetahGrid.columns.type.ButtonColumn({
        caption: "LINK",
      }),
      action: new cheetahGrid.columns.action.ButtonAction({
        action(rec) {
          window.open(rec.url, "_blank");
        },
      }),
    },
  ],
});
const vulsIconUrl =
  "https://github.com/future-architect/vuls/raw/master/img/vuls_icon.png";
const uroboroSQLIconUrl =
  "https://future-architect.github.io/uroborosql-doc/favicon.ico";
const urushiIconUrl =
  "http://future-architect.github.io/urushi/gh-pages-resoucres/favicon.ico";
grid.records = [
  {
    label: "Vuls: VULnerability Scanner",
    iconSrc: [vulsIconUrl, vulsIconUrl, vulsIconUrl, vulsIconUrl],
    url: "https://github.com/future-architect/vuls",
  },
  {
    label: "uroboroSQL",
    iconSrc: [uroboroSQLIconUrl, uroboroSQLIconUrl, uroboroSQLIconUrl],
    url: "https://future-architect.github.io/uroborosql-doc/",
  },
  {
    label: "Urushi",
    iconSrc: [urushiIconUrl, urushiIconUrl],
    url: "http://future-architect.github.io/urushi/",
  },
  {
    label: "Awesome OSS",
    iconSrc: [vulsIconUrl, uroboroSQLIconUrl, urushiIconUrl],
    url: "https://future-architect.github.io/",
  },
];
```

</code-preview>

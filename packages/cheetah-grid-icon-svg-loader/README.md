# cheetah-grid-icon-svg-loader

Webpack loader that loads the icon module for Cheetah Grid from SVG.

## Installation

```bash
npm install --save-dev cheetah-grid-icon-svg-loader
```

## Usage

```js
const icons = {
  gridOn: require("cheetah-grid-icon-svg-loader!material-design-icons/image/svg/production/ic_grid_on_24px.svg"),
};

cheetahGrid.register.icons(icons);

// …

const grid = new cheetahGrid.ListGrid({
  header: [
    // …
    {
      field: "…",
      caption: "…",
      icon: {
        name: "gridOn",
        width: 24,
      },
    },
  ],
  // …
});
```

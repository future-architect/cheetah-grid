# unplugin-cheetah-grid-icon-svg

Unplugin that loads the icon module for Cheetah Grid from SVG.

This package is the Vite-friendly replacement for `cheetah-grid-icon-svg-loader`.
It uses the same SVG-to-icon conversion logic and also exposes Rollup, Rolldown,
Webpack, Rspack, and esbuild adapters through `unplugin`.

## Installation

```bash
npm install --save-dev unplugin-cheetah-grid-icon-svg
```

## Usage with Vite

```js
import cheetahGridIconSvg from "unplugin-cheetah-grid-icon-svg/vite";

export default {
  plugins: [
    cheetahGridIconSvg(),
  ],
};
```

```js
import gridOn from "material-design-icons/image/svg/production/ic_grid_on_24px.svg?cheetah-grid-icon";

const icons = {
  gridOn,
};

cheetahGrid.register.icons(icons);
```

## Transform a Set of SVG Files

If you want imports from a known icon directory to behave like the old webpack
loader without adding a query to every import, pass `include`.

```js
import cheetahGridIconSvg from "unplugin-cheetah-grid-icon-svg/vite";

export default {
  plugins: [
    cheetahGridIconSvg({
      include: /material-design-icons\/.+\.svg$/,
    }),
  ],
};
```

## Font SVG

Font SVG files are converted to an object whose keys are glyph unicode values,
matching `cheetah-grid-icon-svg-loader`.

```js
import materialIcons from "material-design-icons/iconfont/MaterialIcons-Regular.svg?cheetah-grid-icon";
```

You can also load a single glyph.

```js
import add from "material-design-icons/iconfont/MaterialIcons-Regular.svg?cheetah-grid-icon&glyph-name=add";
```

## Other Bundlers

```js
const cheetahGridIconSvg = require("unplugin-cheetah-grid-icon-svg/webpack");

module.exports = {
  plugins: [
    cheetahGridIconSvg(),
  ],
};
```

```js
import cheetahGridIconSvg from "unplugin-cheetah-grid-icon-svg/rollup";

export default {
  plugins: [
    cheetahGridIconSvg(),
  ],
};
```

```js
import cheetahGridIconSvg from "unplugin-cheetah-grid-icon-svg/rolldown";

export default {
  plugins: [
    cheetahGridIconSvg(),
  ],
};
```

## Options

```ts
interface Options {
  include?: string | RegExp | ((id: string) => boolean) | Array<string | RegExp | ((id: string) => boolean)>;
  exclude?: string | RegExp | ((id: string) => boolean) | Array<string | RegExp | ((id: string) => boolean)>;
  query?: string | string[] | false;
}
```

- `include` transforms matching SVG imports without requiring a query.
- `exclude` prevents matching SVG imports from being transformed.
- `query` changes the query names that opt in to transformation. The default is
  `["cheetah-grid-icon", "cg-icon"]`. Set `query: false` to transform every
  SVG matched by `include`, or every SVG import when `include` is omitted.

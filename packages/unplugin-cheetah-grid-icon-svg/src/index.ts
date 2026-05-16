import { createUnplugin } from "unplugin";

import { shouldTransform, transformSvg } from "./core/transform";
import type { Options } from "./core/transform";

const unplugin = createUnplugin<Options | undefined>((options = {}) => ({
  name: "unplugin-cheetah-grid-icon-svg",
  enforce: "pre",
  transformInclude(id) {
    return shouldTransform(id, options);
  },
  transform(source, id) {
    if (!shouldTransform(id, options)) {
      return null;
    }
    return transformSvg(source, id, options);
  },
}));

export type { FilterPattern, Options } from "./core/transform";
export default unplugin;

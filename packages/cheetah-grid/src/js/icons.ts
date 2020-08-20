/*eslint-disable camelcase*/

import type { IconDefine } from "./ts-types";
import { extend } from "./internal/utils";
import { icons as plugins } from "./plugins/icons";
const builtins = {
  get arrow_upward(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_arrow_upward_48px.svg");
  },
  get arrow_downward(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_arrow_downward_48px.svg");
  },
  get edit(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/image/svg/production/ic_edit_48px.svg");
  },
  get add(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/content/svg/production/ic_add_48px.svg");
  },
  get star(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/toggle/svg/production/ic_star_24px.svg");
  },
  get star_border(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/toggle/svg/production/ic_star_border_24px.svg");
  },
  get star_half(): IconDefine {
    return require("cheetah-grid-icon-svg-loader!material-design-icons/toggle/svg/production/ic_star_half_24px.svg");
  },
};

export function get(): { [key: string]: IconDefine } {
  return extend(builtins, plugins);
}

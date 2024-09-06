/*eslint-disable camelcase*/

import type { IconDefine } from "./ts-types";
import { extend } from "./internal/utils";
import { icons as plugins } from "./plugins/icons";
const builtins = {
  get arrow_upward(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_arrow_upward_48px.svg");
    return {
      d: "M8 24l2.83 2.83L22 15.66V40h4V15.66l11.17 11.17L40 24 24 8 8 24z",
      width: 48,
      height: 48,
    };
  },
  get arrow_downward(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_arrow_downward_48px.svg");
    return {
      d: "M40 24l-2.82-2.82L26 32.34V8h-4v24.34L10.84 21.16 8 24l16 16 16-16z",
      width: 48,
      height: 48,
    };
  },
  get edit(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/image/svg/production/ic_edit_48px.svg");
    return {
      d: "M6 34.5V42h7.5l22.13-22.13-7.5-7.5L6 34.5zm35.41-20.41c.78-.78.78-2.05 0-2.83l-4.67-4.67c-.78-.78-2.05-.78-2.83 0l-3.66 3.66 7.5 7.5 3.66-3.66z",
      width: 48,
      height: 48,
    };
  },
  get add(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/content/svg/production/ic_add_48px.svg");
    return {
      d: "M38 26H26v12h-4V26H10v-4h12V10h4v12h12v4z",
      width: 48,
      height: 48,
    };
  },
  get star(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/toggle/svg/production/ic_star_24px.svg");
    return {
      d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
      width: 24,
      height: 24,
    };
  },
  get star_border(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/toggle/svg/production/ic_star_border_24px.svg");
    return {
      d: "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z",
      width: 24,
      height: 24,
    };
  },
  get star_half(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/toggle/svg/production/ic_star_half_24px.svg");
    return {
      d: "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z",
      width: 24,
      height: 24,
    };
  },
  get keyboard_arrow_down(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/hardware/svg/production/ic_keyboard_arrow_down_48px.svg");
    return {
      d: "M14.83 16.42L24 25.59l9.17-9.17L36 19.25l-12 12-12-12z",
      width: 48,
      height: 48,
    };
  },
  get keyboard_arrow_left(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/hardware/svg/production/ic_keyboard_arrow_left_48px.svg");
    return {
      d: "M30.83 32.67l-9.17-9.17 9.17-9.17L28 11.5l-12 12 12 12z",
      width: 48,
      height: 48,
    };
  },
  get keyboard_arrow_right(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/hardware/svg/production/ic_keyboard_arrow_right_48px.svg");
    return {
      d: "M17.17 32.92l9.17-9.17-9.17-9.17L20 11.75l12 12-12 12z",
      width: 48,
      height: 48,
    };
  },
  get keyboard_arrow_up(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/hardware/svg/production/ic_keyboard_arrow_up_48px.svg");
    return {
      d: "M14.83 30.83L24 21.66l9.17 9.17L36 28 24 16 12 28z",
      width: 48,
      height: 48,
    };
  },
  get chevron_left(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_chevron_left_48px.svg");
    return {
      d: "M14.83 30.83L24 21.66l9.17 9.17L36 28 24 16 12 28z",
      width: 48,
      height: 48,
    };
  },
  get chevron_right(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_chevron_right_48px.svg");
    return {
      d: "M20 12l-2.83 2.83L26.34 24l-9.17 9.17L20 36l12-12z",
      width: 48,
      height: 48,
    };
  },
  get expand_less(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_expand_less_48px.svg");
    return {
      d: "M24 16L12 28l2.83 2.83L24 21.66l9.17 9.17L36 28z",
      width: 48,
      height: 48,
    };
  },
  get expand_more(): IconDefine {
    // return require("cheetah-grid-icon-svg-loader!material-design-icons/navigation/svg/production/ic_expand_more_48px.svg");
    return {
      d: "M33.17 17.17L24 26.34l-9.17-9.17L12 20l12 12 12-12z",
      width: 48,
      height: 48,
    };
  },
};

export function get(): { [key: string]: IconDefine } {
  return extend(builtins, plugins);
}

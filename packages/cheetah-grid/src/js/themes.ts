import { extend, getIgnoreCase } from "./internal/utils";
import { Theme } from "./themes/theme";
import type { ThemeDefine } from "./ts-types";
import basicTheme from "./themes/BASIC";
import materialDesignTheme from "./themes/MATERIAL_DESIGN";
import { themes as plugins } from "./plugins/themes";

export const BASIC = new Theme(basicTheme);
export const MATERIAL_DESIGN = new Theme(materialDesignTheme);

const builtin: { [key: string]: Theme } = {
  BASIC,
  MATERIAL_DESIGN,
};
let defTheme = MATERIAL_DESIGN;

export const theme = { Theme };
export function of(
  value: ThemeDefine | string | undefined | null
): Theme | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    const t = getIgnoreCase(getChoices(), value);
    if (t) {
      return t;
    }
    return null;
  }
  if (value instanceof Theme) {
    return value;
  }
  return new Theme(value);
}

export function getDefault(): Theme {
  return defTheme;
}
export function setDefault(defaultTheme: Theme): void {
  defTheme = of(defaultTheme) || defTheme;
}
export function getChoices(): { [key: string]: Theme } {
  return extend(builtin, plugins);
}

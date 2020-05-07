import type { IconDefine } from "./ts-types";
import type { Theme } from "./themes/theme";
import { icons as iconPlugins } from "./plugins/icons";
import { themes as themePlugins } from "./plugins/themes";

function register<T>(obj: { [key: string]: T }, name: string, value: T): T {
  const old = obj[name];
  obj[name] = value;
  return old;
}

function registers<T>(
  obj: { [key: string]: T },
  values: { [key: string]: T }
): void {
  for (const k in values) {
    obj[k] = values[k];
  }
}

export function theme(name: string, theme?: Theme): Theme {
  if (theme != null) {
    return register(themePlugins, name, theme);
  } else {
    return themePlugins[name];
  }
}
export function icon(name: string, icon?: IconDefine): IconDefine {
  if (icon != null) {
    return register(iconPlugins, name, icon);
  } else {
    return iconPlugins[name];
  }
}
export function icons(icons: { [key: string]: IconDefine }): void {
  return registers(iconPlugins, icons);
}

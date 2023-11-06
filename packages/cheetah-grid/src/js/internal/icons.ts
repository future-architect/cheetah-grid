import type {
  ColumnIconOption,
  FontIcon,
  ImageIcon,
  NamedIcon,
  PathIcon,
  SvgIcon,
} from "../ts-types";
import type { SimpleColumnIconOption } from "../ts-types-internal";

type ColumnIconArrayOption = {
  content?: (string | null)[];
  font?: (string | null)[];
  color?: (string | null)[];
  className?: (string | null)[];
  tagName?: (string | null)[];
  isLiga?: (boolean | null)[];
  width?: (number | null)[];
  src?: (string | null)[];
  svg?: (string | null)[];
  name?: (string | null)[];
  path?: (string | null)[];
};

type IconPropKey = (
  | keyof FontIcon<unknown>
  | keyof ImageIcon<unknown>
  | keyof PathIcon<unknown>
  | keyof SvgIcon<unknown>
  | keyof NamedIcon<unknown>
) &
  keyof SimpleColumnIconOption;
const ICON_PROP_KEYS: IconPropKey[] = [
  "content",
  "font",
  "color",
  "className",
  "tagName",
  "isLiga",
  "width",
  "src",
  "svg",
  "name",
  "path",
  "offsetTop",
  "offsetLeft",
];

function quote(name: string): string {
  const quoted = [];
  const split = name.split(/,\s*/);
  for (let i = 0; i < split.length; i++) {
    const part = split[i].replace(/['"]/g, "");
    if (part.indexOf(" ") === -1 && !/^\d/.test(part)) {
      quoted.push(part);
    } else {
      quoted.push(`'${part}'`);
    }
  }
  return quoted.join(",");
}

const doms: {
  [tagName: string]: HTMLElement;
} = {};
const props: {
  [tagName: string]: {
    [className: string]: { [key: string]: string | number | boolean };
  };
} = {};

export function getIconProps(
  tagName: string,
  className: string
): SimpleColumnIconOption {
  const tagProps = props[tagName] || (props[tagName] = {});
  if (tagProps[className]) {
    return tagProps[className];
  }
  const dom =
    doms[tagName] || (doms[tagName] = document.createElement(tagName));
  // `classList.add()` cannot be used because it may be separated by spaces.
  dom.className = className;
  dom.classList.add("cheetah-grid-icon");
  document.body.appendChild(dom);
  try {
    const beforeStyle = (document.defaultView || window).getComputedStyle(
      dom,
      "::before"
    );
    let content = beforeStyle.getPropertyValue("content");
    if (content.length >= 3 && (content[0] === '"' || content[0] === "'")) {
      if (content[0] === content[content.length - 1]) {
        content = content.slice(1, -1);
      }
    }
    let font = beforeStyle.getPropertyValue("font");
    if (!font) {
      font = `${beforeStyle.getPropertyValue(
        "font-style"
      )} ${beforeStyle.getPropertyValue(
        "font-variant"
      )} ${beforeStyle.getPropertyValue(
        "font-weight"
      )} ${beforeStyle.getPropertyValue(
        "font-size"
      )}/${beforeStyle.getPropertyValue("line-height")} ${quote(
        beforeStyle.getPropertyValue("font-family")
      )}`;
    }
    const color = beforeStyle.getPropertyValue("color");
    const width = dom.clientWidth;
    const isLiga =
      (beforeStyle.getPropertyValue("font-feature-settings") || "").indexOf(
        "liga"
      ) > -1;

    return (tagProps[className] = {
      content,
      font,
      color,
      width,
      isLiga,
    });
  } finally {
    document.body.removeChild(dom);
  }
}

function toPropArray<T>(prop: T, count: number): (T | null)[] {
  const result: (T | null)[] = [];
  if (Array.isArray(prop)) {
    result.push(...prop);
    for (let i = prop.length; i < count; i++) {
      result.push(null);
    }
  } else {
    for (let i = 0; i < count; i++) {
      result.push(prop);
    }
  }
  return result;
}

function toSimpleArray(
  iconProps: ColumnIconOption<unknown> | ColumnIconOption<unknown>[]
): SimpleColumnIconOption[] {
  if (!iconProps) {
    return iconProps;
  } else if (Array.isArray(iconProps)) {
    return iconProps;
  }

  const workData = {} as Required<ColumnIconArrayOption>;

  let count = 0;
  ICON_PROP_KEYS.forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prop = (iconProps as any)[k];
    if (prop) {
      if (Array.isArray(prop)) {
        count = Math.max(count, prop.length);
      } else {
        count = Math.max(count, 1);
      }
    }
  });

  ICON_PROP_KEYS.forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = toPropArray((iconProps as any)[k], count);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (workData as any)[k] = arr;
  });

  const result: SimpleColumnIconOption[] = [];
  for (let i = 0; i < count; i++) {
    const data = {} as SimpleColumnIconOption;
    ICON_PROP_KEYS.forEach((k) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (workData as any)[k][i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any)[k] = val;
    });
    result.push(data);
  }
  return result;
}

function normalize(iconProps: SimpleColumnIconOption): SimpleColumnIconOption {
  const data: SimpleColumnIconOption = {};
  for (const k in iconProps) {
    if (k === "className") {
      continue;
    }
    if (isIconKey(k)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data[k] = iconProps[k] as any;
    }
  }
  if (iconProps.className) {
    const prop = getIconProps(iconProps.tagName || "i", iconProps.className);
    for (const k in prop) {
      if (isIconKey(k)) {
        if (iconProps[k] == null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data[k] = prop[k] as any;
        }
      }
    }
  }
  return data;
}

export function toNormalizeArray(
  iconProps: ColumnIconOption<unknown> | ColumnIconOption<unknown>[]
): SimpleColumnIconOption[] {
  const icons = toSimpleArray(iconProps);
  if (!icons) {
    return icons;
  }
  return icons.map((icon) => normalize(icon));
}
export const iconPropKeys = ICON_PROP_KEYS;

function isIconKey(k: string): k is IconPropKey {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ICON_PROP_KEYS.indexOf(k as any) >= 0;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  {
    classList,
    text,
    html,
  }: { classList?: string[] | string; text?: string; html?: string } = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (classList) {
    if (Array.isArray(classList)) {
      element.classList.add(...classList);
    } else {
      element.classList.add(classList);
    }
  }
  if (text) {
    element.textContent = text;
  } else if (html) {
    element.innerHTML = html;
  }
  return element;
}

export function empty(dom: HTMLElement): void {
  let c;
  while ((c = dom.firstChild)) {
    dom.removeChild(c);
  }
}
function isNode(arg: HTMLElement | string): arg is HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!((arg as any).nodeType && (arg as any).nodeName);
}
function toNode(arg: HTMLElement | string): HTMLElement | HTMLElement[] {
  if (isNode(arg)) {
    return arg;
  }
  const dom = createElement("div", { html: arg });
  return Array.prototype.slice.call(dom.childNodes) as HTMLElement[];
}
export function toNodeList(
  arg: HTMLElement | HTMLElement[] | string
): HTMLElement[] {
  if (Array.isArray(arg)) {
    const result: HTMLElement[] = [];
    arg.forEach((e) => {
      result.push(...toNodeList(e));
    });
    return result;
  }
  const node = toNode(arg);
  return Array.isArray(node) ? node : [node];
}

export function appendHtml(
  dom: HTMLElement,
  inner: HTMLElement | HTMLElement[] | string
): void {
  toNodeList(inner).forEach((node) => {
    dom.appendChild(node);
  });
}

export function disableFocus(el: HTMLElement): void {
  el.dataset.disableBeforeTabIndex = `${el.tabIndex}`;
  el.tabIndex = -1;
  Array.prototype.slice.call(el.children, 0).forEach(disableFocus);
}
export function enableFocus(el: HTMLElement): void {
  if ("disableBeforeTabIndex" in el.dataset) {
    el.tabIndex = Number(el.dataset.disableBeforeTabIndex);
  }
  Array.prototype.slice.call(el.children, 0).forEach(enableFocus);
}

export function isFocusable(el: Node): el is HTMLElement {
  return (
    (el as HTMLElement).tabIndex != null && (el as HTMLElement).tabIndex > -1
  );
}
export function findPrevSiblingFocusable(el: HTMLElement): HTMLElement | null {
  let n = el.previousSibling;
  while (n && !isFocusable(n)) {
    n = n.previousSibling;
  }
  return n;
}
export function findNextSiblingFocusable(el: HTMLElement): HTMLElement | null {
  let n = el.nextSibling;
  while (n && !isFocusable(n)) {
    n = n.nextSibling;
  }
  return n;
}

import "./style.css";

function getScrollBarWidth() {
  const wrapper = document.createElement("div");
  const inner = document.createElement("div");
  const { style: wrapperStyle } = wrapper;
  wrapperStyle.position = "fixed";
  wrapperStyle.height = "50px";
  wrapperStyle.width = "50px";
  wrapperStyle.overflow = "scroll";
  wrapperStyle.opacity = "0";
  wrapperStyle.pointerEvents = "none";

  const { style } = inner;
  style.height = "100%";
  style.width = "100%";
  inner.textContent = "x";
  wrapper.appendChild(inner);
  document.body.appendChild(wrapper);
  const wrapperWidth = wrapper.getBoundingClientRect().width;
  const innerWidth = inner.getBoundingClientRect().width;
  document.body.removeChild(wrapper);
  return Math.ceil(wrapperWidth - innerWidth);
}

function validateCSSLoaded() {
  const style = getComputedStyle(document.body);
  if (style.getPropertyValue("--cheetah-grid-css-enable") !== "1") {
    console.warn(`Cheetah Grid CSS is not enabled!
Please load 'cheetah-grid/main.css' before running the cheetah-grid script.

For example, if you bundle your application:

  import 'cheetah-grid/main.css'

For example, if you use CDN:

  <link rel="stylesheet" href="https://unpkg.com/cheetah-grid@2/main.css" />
`);
  }
}

let SCROLLBAR_SIZE: number;
function initDocumentInternal(): void {
  validateCSSLoaded();
  SCROLLBAR_SIZE = getScrollBarWidth() || 10;

  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.setAttribute("data-name", "cheetah-grid");
  style.innerHTML = `
.cheetah-grid .grid-scroll-end-point {
	width: ${SCROLLBAR_SIZE}px;
	height: ${SCROLLBAR_SIZE}px;
}
.cheetah-grid > canvas {
	width: calc(100% - ${SCROLLBAR_SIZE}px);
	height: calc(100% - ${SCROLLBAR_SIZE}px);
}
`;

  document.body.appendChild(style);
}

let initDocumentVar = initDocumentInternal;

export function initDocument(): void {
  initDocumentVar();
  initDocumentVar = Function.prototype as () => void;
}
export function getScrollBarSize(): number {
  return SCROLLBAR_SIZE;
}

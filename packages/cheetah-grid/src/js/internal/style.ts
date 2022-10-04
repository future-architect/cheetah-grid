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

let SCROLLBAR_SIZE: number;
function initDocumentInternal(): void {
  require("@/internal/style.css");
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
	width: -webkit-calc(100% - ${SCROLLBAR_SIZE}px);
	width: calc(100% - ${SCROLLBAR_SIZE}px);
	height: -webkit-calc(100% - ${SCROLLBAR_SIZE}px);
	height: calc(100% - ${SCROLLBAR_SIZE}px);
}
		`;

  document.head.appendChild(style);
}

let initDocumentVar = initDocumentInternal;

export function initDocument(): void {
  initDocumentVar();
  initDocumentVar = Function.prototype as () => void;
}
export function getScrollBarSize(): number {
  return SCROLLBAR_SIZE;
}

function getScrollBarWidth(): number {
  const dummy = document.createElement("div");
  const { style } = dummy;
  style.position = "absolute";
  style.height = "9999px";
  style.width = "calc(100vw - 100%)";
  style.opacity = "0";
  dummy.textContent = "x";
  document.body.appendChild(dummy);
  const { width } = (document.defaultView || window).getComputedStyle(
    dummy,
    ""
  );
  document.body.removeChild(dummy);
  return parseInt(width, 10);
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

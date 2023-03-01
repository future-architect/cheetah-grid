import type {
  CellContext,
  GridCanvasHelperAPI,
  IndicatorStyle,
} from "../../ts-types";

export function drawTopLeftTriangleIndicator(
  context: CellContext,
  style: IndicatorStyle,
  helper: GridCanvasHelperAPI
): void {
  helper.drawBorderWithClip(context, (ctx: CanvasRenderingContext2D): void => {
    const color =
      style.color ||
      helper.getColor(
        helper.theme.indicators.topLeftColor,
        context.col,
        context.row,
        ctx
      );
    const rect = context.getRect();
    const size =
      (style.size && Number(style.size)) ||
      helper.theme.indicators.topLeftSize ||
      rect.height / 6;
    // draw box
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(rect.left, rect.top);
    ctx.lineTo(rect.left + size, rect.top);
    ctx.lineTo(rect.left, rect.top + size);
    ctx.closePath();
    ctx.fill();
  });
}

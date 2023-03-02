import type {
  CellContext,
  GridCanvasHelperAPI,
  IndicatorStyle,
} from "../../ts-types";

export function drawTriangleIndicator(
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
    const baseLeft = rect.left + 1;
    const baseTop = rect.top + 1;

    // draw triangle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(baseLeft, baseTop);
    ctx.lineTo(baseLeft + size, baseTop);
    ctx.lineTo(baseLeft, baseTop + size);
    ctx.closePath();
    ctx.fill();
  });
}

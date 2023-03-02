import type {
  CellContext,
  ColorPropertyDefine,
  GridCanvasHelperAPI,
  IndicatorObject,
  RectProps,
} from "../../ts-types";
import { DrawIndicatorKind } from "./type";

type KindProcess = {
  themeColor: (helper: GridCanvasHelperAPI) => ColorPropertyDefine;
  themeSize: (helper: GridCanvasHelperAPI) => number;
  drawPath: (
    ctx: CanvasRenderingContext2D,
    rect: RectProps,
    size: number
  ) => void;
};
const KIND_PROCESS_MAP: Record<DrawIndicatorKind, KindProcess> = {
  [DrawIndicatorKind.topLeft]: {
    themeColor(helper: GridCanvasHelperAPI) {
      return helper.theme.indicators.topLeftColor;
    },
    themeSize(helper: GridCanvasHelperAPI) {
      return helper.theme.indicators.topLeftSize;
    },
    drawPath(ctx: CanvasRenderingContext2D, rect: RectProps, size: number) {
      const baseLeft = rect.left + 1;
      const baseTop = rect.top + 1;
      ctx.moveTo(baseLeft, baseTop);
      ctx.lineTo(baseLeft + size, baseTop);
      ctx.lineTo(baseLeft, baseTop + size);
    },
  },
  [DrawIndicatorKind.topRight]: {
    themeColor(helper: GridCanvasHelperAPI): ColorPropertyDefine {
      return helper.theme.indicators.topRightColor;
    },
    themeSize(helper: GridCanvasHelperAPI): number {
      return helper.theme.indicators.topRightSize;
    },
    drawPath(
      ctx: CanvasRenderingContext2D,
      rect: RectProps,
      size: number
    ): void {
      const baseRight = rect.right - 2;
      const baseTop = rect.top + 1;
      ctx.moveTo(baseRight, baseTop);
      ctx.lineTo(baseRight - size, baseTop);
      ctx.lineTo(baseRight, baseTop + size);
    },
  },
  [DrawIndicatorKind.bottomRight]: {
    themeColor(helper: GridCanvasHelperAPI): ColorPropertyDefine {
      return helper.theme.indicators.bottomRightColor;
    },
    themeSize(helper: GridCanvasHelperAPI): number {
      return helper.theme.indicators.bottomRightSize;
    },
    drawPath(
      ctx: CanvasRenderingContext2D,
      rect: RectProps,
      size: number
    ): void {
      const baseRight = rect.right - 2;
      const baseBottom = rect.bottom - 2;
      ctx.moveTo(baseRight, baseBottom);
      ctx.lineTo(baseRight - size, baseBottom);
      ctx.lineTo(baseRight, baseBottom - size);
    },
  },
  [DrawIndicatorKind.bottomLeft]: {
    themeColor(helper: GridCanvasHelperAPI): ColorPropertyDefine {
      return helper.theme.indicators.bottomLeftColor;
    },
    themeSize(helper: GridCanvasHelperAPI): number {
      return helper.theme.indicators.bottomLeftSize;
    },
    drawPath(
      ctx: CanvasRenderingContext2D,
      rect: RectProps,
      size: number
    ): void {
      const baseLeft = rect.left + 1;
      const baseBottom = rect.bottom - 2;
      ctx.moveTo(baseLeft, baseBottom);
      ctx.lineTo(baseLeft + size, baseBottom);
      ctx.lineTo(baseLeft, baseBottom - size);
    },
  },
};

export function drawTriangleIndicator(
  context: CellContext,
  style: IndicatorObject,
  kind: DrawIndicatorKind,
  helper: GridCanvasHelperAPI
): void {
  const process = KIND_PROCESS_MAP[kind];
  if (!process) {
    return;
  }
  helper.drawBorderWithClip(context, (ctx: CanvasRenderingContext2D): void => {
    const rect = context.getRect();
    const color =
      style.color ||
      helper.getColor(
        process.themeColor(helper),
        context.col,
        context.row,
        ctx
      );
    const size =
      (style.size && Number(style.size)) ||
      process.themeSize(helper) ||
      rect.height / 6;

    // draw triangle
    ctx.fillStyle = color;
    ctx.beginPath();
    process.drawPath(ctx, rect, size);
    ctx.closePath();
    ctx.fill();
  });
}

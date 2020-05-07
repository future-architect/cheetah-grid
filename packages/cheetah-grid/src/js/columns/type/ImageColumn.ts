import type {
  CellContext,
  GridCanvasHelperAPI,
  ListGridAPI,
  MaybePromise,
} from "../../ts-types";
import { BaseColumn } from "./BaseColumn";
import type { DrawCellInfo } from "../../ts-types-internal";
import { ImageStyle } from "../style/ImageStyle";
import { calcStartPosition } from "../../internal/canvases";
import { getCacheOrLoad } from "../../internal/imgs";

const MAX_LRU_CACHE_SIZE = 50;
function getImage(url: MaybePromise<string>): MaybePromise<HTMLImageElement> {
  return getCacheOrLoad("ImageColumn", MAX_LRU_CACHE_SIZE, url);
}

function calcKeepAspectRatioSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): {
  width: number;
  height: number;
} {
  let newWidth = width;
  let newHeight = height;
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = (newWidth * height) / width;
  }
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = (newHeight * width) / height;
  }
  return {
    width: newWidth,
    height: newHeight,
  };
}

export class ImageColumn<T> extends BaseColumn<T, HTMLImageElement> {
  get StyleClass(): typeof ImageStyle {
    return ImageStyle;
  }
  onDrawCell(
    cellValue: MaybePromise<string>,
    info: DrawCellInfo<T>,
    context: CellContext,
    grid: ListGridAPI<T>
  ): void | Promise<void> {
    return super.onDrawCell(getImage(cellValue), info, context, grid);
  }
  clone(): ImageColumn<T> {
    return new ImageColumn(this);
  }
  drawInternal(
    value: HTMLImageElement,
    context: CellContext,
    style: ImageStyle,
    helper: GridCanvasHelperAPI,
    _grid: ListGridAPI<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    if (value) {
      const { textAlign, textBaseline, margin, bgColor } = style;
      if (bgColor) {
        drawCellBase({
          bgColor,
        });
      }
      helper.drawWithClip(context, (ctx) => {
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        const rect = context.getRect();
        if (style.imageSizing === "keep-aspect-ratio") {
          const { width, height } = calcKeepAspectRatioSize(
            value.width,
            value.height,
            rect.width - margin * 2,
            rect.height - margin * 2
          );
          const pos = calcStartPosition(ctx, rect, width, height, {
            offset: margin,
          });
          ctx.drawImage(
            value,
            0,
            0,
            value.width,
            value.height,
            pos.x,
            pos.y,
            width,
            height
          );
        } else {
          ctx.drawImage(
            value,
            0,
            0,
            value.width,
            value.height,
            rect.left + margin,
            rect.top + margin,
            rect.width - margin * 2,
            rect.height - margin * 2
          );
        }
      });
    }
  }
}

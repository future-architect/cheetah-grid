import {
  calcBasePosition,
  calcStartPosition,
  getFontSize,
} from "../internal/canvases";
import type { ColorDef } from "../ts-types";
import type { PaddingOption } from "../internal/canvases";
const { ceil, PI } = Math;

export function strokeColorsRect(
  ctx: CanvasRenderingContext2D,
  borderColors: [
    ColorDef | null,
    ColorDef | null,
    ColorDef | null,
    ColorDef | null
  ],
  left: number,
  top: number,
  width: number,
  height: number
): void {
  type Position = { x: number; y: number };
  function strokeRectLines(
    positions: [Position, Position, Position, Position, Position]
  ): void {
    for (let i = 0; i < borderColors.length; i++) {
      const color = borderColors[i];
      const preColor = borderColors[i - 1];
      if (color) {
        if (preColor !== color) {
          if (preColor) {
            ctx.strokeStyle = preColor;
            ctx.stroke();
          }
          const pos1 = positions[i];
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
        }
        const pos2 = positions[i + 1];
        ctx.lineTo(pos2.x, pos2.y);
      } else {
        if (preColor) {
          ctx.strokeStyle = preColor;
          ctx.stroke();
        }
      }
    }
    const preColor = borderColors[borderColors.length - 1];
    if (preColor) {
      ctx.strokeStyle = preColor;
      ctx.stroke();
    }
  }
  if (
    borderColors[0] === borderColors[1] &&
    borderColors[0] === borderColors[2] &&
    borderColors[0] === borderColors[3]
  ) {
    if (borderColors[0]) {
      ctx.strokeStyle = borderColors[0];
      ctx.strokeRect(left, top, width, height);
    }
  } else {
    strokeRectLines([
      { x: left, y: top },
      { x: left + width, y: top },
      { x: left + width, y: top + height },
      { x: left, y: top + height },
      { x: left, y: top },
    ]);
  }
}
export function roundRect(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.arc(left + radius, top + radius, radius, -PI, -0.5 * PI, false);
  ctx.arc(left + width - radius, top + radius, radius, -0.5 * PI, 0, false);
  ctx.arc(
    left + width - radius,
    top + height - radius,
    radius,
    0,
    0.5 * PI,
    false
  );
  ctx.arc(left + radius, top + height - radius, radius, 0.5 * PI, PI, false);
  ctx.closePath();
}
export function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number
): void {
  roundRect(ctx, left, top, width, height, radius);
  ctx.fill();
}
export function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number
): void {
  roundRect(ctx, left, top, width, height, radius);
  ctx.stroke();
}
export function fillCircle(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  const min = Math.min(width, height) / 2;
  ctx.beginPath();
  ctx.arc(left + min, top + min, min, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}
export function strokeCircle(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  const min = Math.min(width, height) / 2;
  ctx.beginPath();
  ctx.arc(left + min, top + min, min, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();
}

export type FillTextRectOption = {
  offset?: number;
  padding?: PaddingOption;
};
export function fillTextRect(
  ctx: CanvasRenderingContext2D,
  text: string,
  left: number,
  top: number,
  width: number,
  height: number,
  { offset = 2, padding }: FillTextRectOption = {}
): void {
  const rect = {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
  ctx.save();
  try {
    ctx.beginPath();
    ctx.rect(rect.left, rect.top, rect.width, rect.height);
    //clip
    ctx.clip();

    //文字描画
    const pos = calcBasePosition(ctx, rect, {
      offset,
      padding,
    });

    ctx.fillText(text, pos.x, pos.y);
  } finally {
    ctx.restore();
  }
}

export type DrawInlineImageRectOption = {
  offset?: number;
  padding?: PaddingOption;
};
export function drawInlineImageRect(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  srcLeft: number,
  srcTop: number,
  srcWidth: number,
  srcHeight: number,
  destWidth: number,
  destHeight: number,
  left: number,
  top: number,
  width: number,
  height: number,
  { offset = 2, padding }: DrawInlineImageRectOption = {}
): void {
  const rect = {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
  ctx.save();
  try {
    ctx.beginPath();
    ctx.rect(rect.left, rect.top, rect.width, rect.height);
    //clip
    ctx.clip();

    //文字描画
    const pos = calcStartPosition(ctx, rect, destWidth, destHeight, {
      offset,
      padding,
    });

    ctx.drawImage(
      image,
      srcLeft,
      srcTop,
      srcWidth,
      srcHeight,
      pos.x,
      pos.y,
      destWidth,
      destHeight
    );
  } finally {
    ctx.restore();
  }
}

/**
 * Returns an object containing the width of the checkbox.
 * @param  {CanvasRenderingContext2D} ctx canvas context
 * @return {Object} Object containing the width of the checkbox
 * @memberof cheetahGrid.tools.canvashelper
 */
export function measureCheckbox(ctx: CanvasRenderingContext2D): {
  width: number;
} {
  return {
    width: getFontSize(ctx, null).width,
  };
}

/**
 * Returns an object containing the width of the radio button.
 * @param  {CanvasRenderingContext2D} ctx canvas context
 * @return {Object} Object containing the width of the radio button
 * @memberof cheetahGrid.tools.canvashelper
 */
export function measureRadioButton(ctx: CanvasRenderingContext2D): {
  width: number;
} {
  return {
    width: getFontSize(ctx, null).width,
  };
}

export type DrawCheckboxOption = {
  uncheckBgColor?: ColorDef;
  checkBgColor?: ColorDef;
  borderColor?: ColorDef;
  boxSize?: number;
};
/**
 * draw Checkbox
 * @param  {CanvasRenderingContext2D} ctx canvas context
 * @param  {number} x The x coordinate where to start drawing the checkbox (relative to the canvas)
 * @param  {number} y The y coordinate where to start drawing the checkbox (relative to the canvas)
 * @param  {boolean|number} check checkbox check status
 * @param  {object} option option
 * @return {void}
 * @memberof cheetahGrid.tools.canvashelper
 */
export function drawCheckbox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  check: number | boolean,
  {
    uncheckBgColor = "#FFF",
    checkBgColor = "rgb(76, 73, 72)",
    borderColor = "#000",
    boxSize = measureCheckbox(ctx).width,
  }: DrawCheckboxOption = {}
): void {
  const checkPoint = typeof check === "number" ? (check > 1 ? 1 : check) : 1;

  ctx.save();
  try {
    ctx.fillStyle = check ? checkBgColor : uncheckBgColor;
    const leftX = ceil(x);
    const topY = ceil(y);
    const size = ceil(boxSize);

    fillRoundRect(ctx, leftX - 1, topY - 1, size + 1, size + 1, boxSize / 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = borderColor;
    strokeRoundRect(ctx, leftX - 0.5, topY - 0.5, size, size, boxSize / 5);
    if (check) {
      ctx.lineWidth = ceil(boxSize / 10);
      ctx.strokeStyle = uncheckBgColor;
      let leftWidth = boxSize / 4;
      let rightWidth = (boxSize / 2) * 0.9;
      const leftLeftPos = x + boxSize * 0.2;
      const leftTopPos = y + boxSize / 2;

      if (checkPoint < 0.5) {
        leftWidth *= checkPoint * 2;
      }

      ctx.beginPath();
      ctx.moveTo(leftLeftPos, leftTopPos);
      ctx.lineTo(leftLeftPos + leftWidth, leftTopPos + leftWidth);
      if (checkPoint > 0.5) {
        if (checkPoint < 1) {
          rightWidth *= (checkPoint - 0.5) * 2;
        }
        ctx.lineTo(
          leftLeftPos + leftWidth + rightWidth,
          leftTopPos + leftWidth - rightWidth
        );
      }
      ctx.stroke();
    }
  } finally {
    ctx.restore();
  }
}

export type DrawRadioButtonOption = {
  checkColor?: ColorDef;
  borderColor?: ColorDef;
  bgColor?: ColorDef;
  boxSize?: number;
};
/**
 * draw Radio button
 * @param  {CanvasRenderingContext2D} ctx canvas context
 * @param  {number} x The x coordinate where to start drawing the radio button (relative to the canvas)
 * @param  {number} y The y coordinate where to start drawing the radio button (relative to the canvas)
 * @param  {boolean|number} check radio button check status
 * @param  {object} option option
 * @return {void}
 * @memberof cheetahGrid.tools.canvashelper
 */
export function drawRadioButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  check: number | boolean,
  {
    checkColor = "rgb(76, 73, 72)",
    borderColor = "#000",
    bgColor = "#FFF",
    boxSize = measureRadioButton(ctx).width,
  }: DrawRadioButtonOption = {}
): void {
  const ratio = typeof check === "number" ? (check > 1 ? 1 : check) : 1;

  ctx.save();
  try {
    ctx.fillStyle = bgColor;
    const leftX = ceil(x);
    const topY = ceil(y);
    const size = ceil(boxSize);
    fillCircle(ctx, leftX - 1, topY - 1, size + 1, size + 1);

    ctx.lineWidth = 1;
    ctx.strokeStyle = borderColor;
    strokeCircle(ctx, leftX - 0.5, topY - 0.5, size, size);
    if (check) {
      const checkSize = (size * ratio) / 2;
      const padding = (size - checkSize) / 2;
      ctx.fillStyle = checkColor;
      fillCircle(
        ctx,
        ceil((leftX - 0.5 + padding) * 100) / 100,
        ceil((topY - 0.5 + padding) * 100) / 100,
        ceil(checkSize * 100) / 100,
        ceil(checkSize * 100) / 100
      );
    }
  } finally {
    ctx.restore();
  }
}

export type DrawButtonOption = {
  backgroundColor?: ColorDef;
  bgColor?: ColorDef;
  radius?: number;
  shadow?: {
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
    offset?: { x?: number; y?: number };
  };
};
/**
 * draw Button
 */
export function drawButton(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  option: DrawButtonOption = {}
): void {
  const {
    backgroundColor = "#FFF",
    bgColor = backgroundColor,
    radius = 4,
    shadow = {},
  } = option;
  ctx.save();
  try {
    ctx.fillStyle = bgColor;

    if (shadow) {
      const {
        color = "rgba(0, 0, 0, 0.24)",
        blur = 1,
        offsetX = 0,
        offsetY = 2,
        offset: { x: ox = offsetX, y: oy = offsetY } = {},
      } = shadow;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur; //ぼかし
      ctx.shadowOffsetX = ox;
      ctx.shadowOffsetY = oy;
    }

    fillRoundRect(
      ctx,
      ceil(left),
      ceil(top),
      ceil(width),
      ceil(height),
      radius
    );
  } finally {
    ctx.restore();
  }
}

export type Canvashelper = {
  roundRect: typeof roundRect;
  fillRoundRect: typeof fillRoundRect;
  strokeRoundRect: typeof strokeRoundRect;
  drawCheckbox: typeof drawCheckbox;
  measureCheckbox: typeof measureCheckbox;
  fillTextRect: typeof fillTextRect;
  drawButton: typeof drawButton;
  drawInlineImageRect: typeof drawInlineImageRect;
  strokeColorsRect: typeof strokeColorsRect;
};

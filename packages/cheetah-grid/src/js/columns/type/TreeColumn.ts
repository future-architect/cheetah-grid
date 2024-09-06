import * as inlineUtils from "../../element/inlines";
import * as utils from "../../columns/type/columnUtils";
import type {
  ActionAreaPredicate,
  CellAddress,
  CellContext,
  DataSourceAPI,
  FieldDef,
  GridCanvasHelperAPI,
  ListGridAPI,
  MaybePromise,
  RectProps,
  TreeColumnOption,
  TreeDataValue,
} from "../../ts-types";
import type { DrawCellInfo, GridInternal } from "../../ts-types-internal";
import { Column } from "./Column";
import { Rect } from "../../internal/Rect";
import { TreeLineKind } from "../../ts-types-internal";
import { TreeStyle } from "../style/TreeStyle";
import { getFontSize } from "../../internal/canvases";
import { getTreeColumnStateId } from "../../internal/symbolManager";
import { isPromise } from "../../internal/utils";

type NormalizedTreeData = {
  /** The caption of the record */
  caption: string;
  /** An array of path indicating the hierarchy */
  path: unknown[];
  nodeType?: "leaf" | "branch";
};

type TreeInfo = {
  getLines: () => TreeLineKind[];
  caption: string;
  path: unknown[];
};

const _ = getTreeColumnStateId();

export class TreeColumn<T> extends Column<T> {
  private _cache: boolean;
  constructor(option: TreeColumnOption = {}) {
    super(option);
    this._cache = option.cache != null ? option.cache : false;
  }
  get StyleClass(): typeof TreeStyle {
    return TreeStyle;
  }
  clearCache(grid: ListGridAPI<T>): void {
    const internal = grid as GridInternal<T>;
    if (!internal[_]) return;
    delete internal[_].cache;
  }
  get drawnIconActionArea(): ActionAreaPredicate {
    return (param) => {
      const internal = param.grid as GridInternal<T>;
      const state = internal[_];
      if (!state?.drawnIcons) return false;
      const drawnIcons = state.drawnIcons as DrawnIcons;
      return drawnIcons.area(param);
    };
  }
  onDrawCell(
    cellValue: MaybePromise<unknown>,
    info: DrawCellInfo<T>,
    context: CellContext,
    grid: GridInternal<T>
  ): void | Promise<void> {
    const state = grid[_] || (grid[_] = {});
    if (this._cache && !state.cache) {
      const cache = state.cache || (state.cache = new Map());
      const { col, row } = context;
      const field = grid.getField(col, row) as FieldDef<T>;
      if (!cache.has(field)) {
        cache.set(field, new TreeColumnInfo(grid, field));
      }
    }
    return super.onDrawCell(cellValue, info, context, grid);
  }
  clone(): TreeColumn<T> {
    return new TreeColumn(this);
  }
  get cache(): boolean {
    return this._cache;
  }
  getCopyCellValue(value: unknown): unknown {
    const treeData = getTreeDataFromValue(value as TreeDataValue);
    return treeData.caption;
  }
  drawInternal(
    value: unknown,
    context: CellContext,
    style: TreeStyle,
    helper: GridCanvasHelperAPI,
    grid: GridInternal<T>,
    { drawCellBase, getIcon }: DrawCellInfo<T>
  ): void {
    const {
      textAlign,
      textBaseline,
      bgColor,
      padding,
      color,
      font,
      textOverflow,
    } = style;
    if (bgColor) {
      drawCellBase({
        bgColor,
      });
    }

    const state = grid[_] || (grid[_] = {});
    if (state.drawnIcons) {
      const drawnIcons = state.drawnIcons as DrawnIcons;
      drawnIcons.delete(context);
    }

    const { col, row } = context;
    const field = grid.getField(col, row) as FieldDef<T>;
    const tci: TreeColumnInfo<T> = ((this._cache
      ? state.cache?.get(field)
      : null) ?? new TreeColumnInfo(grid, field)) as TreeColumnInfo<T>;
    const info = tci.getInfo(value as TreeDataValue, row);

    helper.testFontLoad(font, info.caption, context);
    utils.loadIcons(getIcon(), context, helper, (icons, context) => {
      const rect = context.getRect();

      const basePadding = helper.toBoxPixelArray(padding || 0, context, font);

      const nestLevel = info.path.length;

      helper.drawWithClip(context, (ctx) => {
        const fontSize = getFontSize(ctx, font);
        const indentSize = fontSize.width;
        const top = rect.top + basePadding[0];
        const left = rect.left + basePadding[3];
        const height = rect.height - basePadding[0] - basePadding[2];
        const lineBaseline = textBaseline ?? (ctx.textBaseline || "middle");

        // Calculate horizontal line position
        let hLineY: number = top + height / 2;
        if (
          lineBaseline === "bottom" ||
          lineBaseline === "alphabetic" ||
          lineBaseline === "ideographic"
        ) {
          // bottom
          hLineY = top + height - fontSize.height / 2;
        } else if (textBaseline === "middle") {
          hLineY = top + height / 2;
        } else {
          // top
          hLineY = top + fontSize.height / 2;
        }
        // Get the tree icon
        const definedTreeIcon =
          style.treeIcon ||
          helper.getStyleProperty(helper.theme.tree.treeIcon, col, row, ctx);
        const treeIcon =
          definedTreeIcon === "none"
            ? null
            : definedTreeIcon === "chevron_right" ||
              definedTreeIcon === "expand_more"
            ? { name: definedTreeIcon, width: fontSize.width }
            : definedTreeIcon;

        // Calculate icon rect
        let iconRect: Rect | null = null;
        if (treeIcon) {
          ctx.save();
          try {
            const treeLineLeft = left + indentSize * (nestLevel - 1);
            const vLineX = treeLineLeft + indentSize / 2;
            const size = inlineUtils.iconOf(treeIcon).width({ ctx });
            iconRect = new Rect(
              vLineX - size / 2,
              hLineY - size / 2,
              size,
              size
            );
          } finally {
            ctx.restore();
          }

          // It preserves the position of the drawn icon
          // because it is used for the `area` option of the `Action` class.
          const drawnIcons = (state.drawnIcons ||
            (state.drawnIcons = new DrawnIcons())) as DrawnIcons;
          drawnIcons.set(context, iconRect);
        }

        // Get tree line color
        const lineStyle = style.lineStyle || helper.theme.tree.lineStyle;

        if (lineStyle !== "none") {
          const lineWidth = style.lineWidth || helper.theme.tree.lineWidth;
          const lineColor =
            style.lineColor ||
            helper.getColor(helper.theme.tree.lineColor, col, row, ctx);

          ctx.save();
          try {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";

            if (iconRect) {
              // Clip icon area
              ctx.beginPath();
              ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);

              // Draw a square in the opposite direction to hollow out the inside.
              ctx.rect(
                iconRect.right,
                iconRect.top,
                -iconRect.width,
                iconRect.height
              );

              // // For debug
              // ctx.fillStyle = "#0002";
              // ctx.fill();

              ctx.clip();
            }

            // Draw tree lines
            info.getLines().forEach((line: TreeLineKind, index: number) => {
              const treeLineLeft = left + indentSize * index;
              const vLineX = treeLineLeft + indentSize / 2;
              const treeLineRight = treeLineLeft + indentSize;
              if (line !== TreeLineKind.none) {
                ctx.beginPath();
                if (line === TreeLineKind.vertical) {
                  ctx.moveTo(vLineX, rect.top);
                  ctx.lineTo(vLineX, rect.bottom);
                } else if (line === TreeLineKind.last) {
                  ctx.moveTo(vLineX, rect.top);
                  ctx.lineTo(vLineX, hLineY);
                  ctx.lineTo(treeLineRight, hLineY);
                } else if (line === TreeLineKind.start) {
                  ctx.moveTo(treeLineRight, hLineY);
                  ctx.lineTo(vLineX, hLineY);
                  ctx.lineTo(vLineX, rect.bottom);
                } else if (line === TreeLineKind.verticalBranch) {
                  ctx.moveTo(vLineX, rect.top);
                  ctx.lineTo(vLineX, rect.bottom);
                  ctx.moveTo(vLineX, hLineY);
                  ctx.lineTo(treeLineRight, hLineY);
                } else if (line === TreeLineKind.horizontal) {
                  ctx.moveTo(treeLineLeft, hLineY);
                  ctx.lineTo(treeLineRight, hLineY);
                } else if (line === TreeLineKind.horizontalBranch) {
                  ctx.moveTo(treeLineLeft, hLineY);
                  ctx.lineTo(treeLineRight, hLineY);
                  ctx.moveTo(vLineX, hLineY);
                  ctx.lineTo(vLineX, rect.bottom);
                } else if (line === TreeLineKind.lone) {
                  ctx.moveTo(vLineX, hLineY);
                  ctx.lineTo(treeLineRight, hLineY);
                }
                ctx.stroke();
              }
            });
          } finally {
            ctx.restore();
          }
        }

        if (treeIcon) {
          // Draw tree icon
          const iconLeftOffset = indentSize * (nestLevel - 1);
          const iconWidth = indentSize;
          const iconPadding = basePadding.slice(0);
          iconPadding[3] += iconLeftOffset;
          iconPadding[1] = rect.width - iconWidth - iconPadding[3]; // padding right

          helper.text("", context, {
            textAlign: "center",
            textBaseline,
            color,
            font,
            icons: [treeIcon],
            padding: iconPadding,
          });
        }

        const textPadding = basePadding.slice(0);
        textPadding[3] += nestLevel * indentSize; // Tree indent padding

        helper.text(info.caption, context, {
          textAlign,
          textBaseline,
          color,
          font,
          padding: textPadding,
          textOverflow,
          icons,
        });
      });
    });
  }
}

/**
 * If the cell is a TreeColumn, gets the tree node information from the given cell.
 */
export function getTreeNodeInfoAt<T>({
  grid,
  col,
  row,
}: CellAddress & {
  grid: ListGridAPI<T>;
}): { hasChildren: boolean; nodeType: "leaf" | "branch" } {
  const field = grid.getField(col, row);
  if (!field) return { hasChildren: false, nodeType: "leaf" };
  const { dataSource } = grid;
  const currIndex = grid.getRecordIndexByRow(row);
  const value = dataSource.getField(currIndex, field);
  const treeData = getTreeDataFromValue(value);
  const hasChildren = hasChildrenByRecord(
    treeData,
    dataSource,
    field,
    currIndex
  );
  return {
    nodeType: hasChildren ? "branch" : treeData.nodeType || "leaf",
    hasChildren,
  };
}

function hasChildrenByRecord<T>(
  treeData: NormalizedTreeData,
  dataSource: DataSourceAPI<T>,
  field: FieldDef<T>,
  recordIndex: number
): boolean {
  const next = dataSource.getField(recordIndex + 1, field);
  if (!next || isPromise(next)) return false;
  const nextParentPath = getParentPath(next);
  return (
    treeData.path.length === nextParentPath.length &&
    nextParentPath.every((p, i) => p === treeData.path[i])
  );
}

class TreeColumnInfo<T> {
  private _cache: Record<
    number,
    {
      hasNextSiblings: (boolean | undefined)[];
    }
  > = {};
  private _grid: ListGridAPI<T>;
  private _field: FieldDef<T>;
  constructor(grid: ListGridAPI<T>, field: FieldDef<T>) {
    this._grid = grid;
    this._field = field;
  }
  getInfo(value: TreeDataValue, row: number): TreeInfo {
    const { _field: field, _grid: grid, _cache: cache } = this;
    const currIndex = grid.getRecordIndexByRow(row);
    const { dataSource } = grid;
    const treeData = getTreeDataFromValue(value);

    const hasChildren = hasChildrenByRecord(
      treeData,
      dataSource,
      field,
      currIndex
    );

    return {
      caption: treeData.caption,
      path: treeData.path,
      getLines() {
        const currPath: unknown[] = [];
        const parentPath = treeData.path.slice(0, -1);
        const parentLines: TreeLineKind[] = parentPath.map((p, index) => {
          currPath.push(p);
          const isLast = index === parentPath.length - 1;
          if (hasNextSiblingWithCache(currPath)) {
            return isLast ? TreeLineKind.verticalBranch : TreeLineKind.vertical;
          } else {
            return isLast ? TreeLineKind.last : TreeLineKind.none;
          }
        });

        let selfLine: TreeLineKind;
        if (hasChildren) {
          selfLine =
            parentPath.length > 0
              ? TreeLineKind.horizontalBranch
              : TreeLineKind.start;
        } else {
          selfLine =
            parentPath.length > 0 ? TreeLineKind.horizontal : TreeLineKind.lone;
        }
        return parentLines.concat(selfLine);
      },
    };

    function hasNextSiblingWithCache(parentPath: unknown[]): boolean {
      const has = hasNextSiblingFromCache(currIndex, parentPath.length);
      if (has != null) {
        return has;
      }
      const result = hasNextSibling(parentPath);
      for (let index = currIndex; index < result.end; index++) {
        setNextSiblingToCache(index, parentPath.length, result.has);
      }
      return result.has;
    }

    function hasNextSiblingFromCache(
      index: number,
      level: number
    ): boolean | undefined {
      const { hasNextSiblings } =
        cache[index] || (cache[index] = { hasNextSiblings: [] });
      return hasNextSiblings[level];
    }

    function setNextSiblingToCache(
      index: number,
      level: number,
      value: boolean
    ): void {
      const { hasNextSiblings } =
        cache[index] || (cache[index] = { hasNextSiblings: [] });
      hasNextSiblings[level] = value;
    }

    function hasNextSibling(parentPath: unknown[]): {
      end: number;
      has: boolean;
    } {
      const startIndex = currIndex + 1;
      for (let index = startIndex; index < dataSource.length; index++) {
        const data = dataSource.getField(index, field);
        if (isPromise(data)) return { end: index, has: false };
        const nextPath = getParentPath(data);
        if (!nextPath.length) return { end: index, has: false };
        if (parentPath.every((p, i) => p === nextPath[i])) {
          // All matches!
          if (parentPath.length < nextPath.length) {
            // It's a child.
            // e.g.
            // ├ target
            // │ ├ next
            const has = hasNextSiblingFromCache(index, parentPath.length);
            if (has != null) return { end: index, has };
            continue;
          }
          // There is next sibling.
          // e.g.
          // ├ target
          // │ ├ x
          // │ └ x
          // └ next
          return { end: index, has: true };
        }
        // There is no next sibling.
        // e.g.
        // │ └ target
        // │   ├ x
        // │   └ x
        // └ next
        return { end: index, has: false };
      }

      // There is no next sibling.
      return { end: dataSource.length, has: false };
    }
  }
}

function getTreeDataFromValue(value: TreeDataValue): NormalizedTreeData {
  if (value != null) {
    if (Array.isArray(value)) {
      return getTreeDataFromValue({ path: value });
    } else {
      if (Array.isArray(value.path))
        return {
          caption: String(
            value.caption ?? value.path[value.path.length - 1] ?? ""
          ),
          path: value.path,
          nodeType: value.nodeType as never,
        };
      if (typeof value.path === "function")
        return getTreeDataFromValue({ ...value, path: value.path() });
    }
  }

  return { caption: String(value ?? ""), path: [value] };
}

function getParentPath(value: TreeDataValue): unknown[] {
  return getTreeDataFromValue(value).path.slice(0, -1);
}

class DrawnIcons {
  private _drawnIcons = new Map<string, RectProps>();
  set(cell: CellAddress, clipRect: RectProps) {
    this._drawnIcons.set(`${cell.col}:${cell.row}`, clipRect);
  }
  delete(cell: CellAddress) {
    this._drawnIcons.delete(`${cell.col}:${cell.row}`);
  }
  area({
    col,
    row,
    pointInDrawingCanvas: point,
  }: Parameters<ActionAreaPredicate>[0]): boolean {
    const key = `${col}:${row}`;
    const rect = this._drawnIcons.get(key);
    if (!rect) {
      return false;
    }
    return (
      rect.left <= point.x &&
      point.x <= rect.right &&
      rect.top <= point.y &&
      point.y <= rect.bottom
    );
  }
}

import type { Locator, Page } from "playwright-core";
import type * as cheetahGridNamespace from "cheetah-grid";

type CheetahGridNamespace = typeof cheetahGridNamespace;

type CellSpec =
  | { type: "gridCell"; field: string; index: number }
  | { type: "cell"; col: number; row: number };

/**
 * Runs an operation on a cell.
 * NOTE: This function is serialized and executed in the page context,
 * so it must be self-contained.
 */
async function cellOperation(
  el: SVGElement | HTMLElement,
  { spec, op }: { spec: CellSpec; op: "rect" | "value" }
): Promise<unknown> {
  const ns = (window as unknown as { cheetahGrid?: CheetahGridNamespace })
    .cheetahGrid;
  if (!ns) {
    throw new Error(
      '"window.cheetahGrid" is not defined. Expose the cheetahGrid namespace for automation (e.g. `window.cheetahGrid = cheetahGrid`).'
    );
  }
  const inner = el.querySelector(".cheetah-grid");
  const grid =
    ns.ListGrid.getInstanceByElement(el) ??
    (inner ? ns.ListGrid.getInstanceByElement(inner) : undefined);
  if (!grid) {
    throw new Error("No ListGrid instance is associated with the element.");
  }
  let col: number;
  let row: number;
  if (spec.type === "gridCell") {
    const range = grid.getCellRangeByField(spec.field, spec.index);
    if (!range) {
      throw new Error(
        `Cell not found: field=${spec.field}, index=${spec.index}`
      );
    }
    ({ col, row } = range.start);
  } else {
    ({ col, row } = spec);
  }
  if (op === "value") {
    return grid.getCellValue(col, row);
  }
  // op === "rect"
  const before = { left: grid.scrollLeft, top: grid.scrollTop };
  grid.makeVisibleCell(col, row);
  if (grid.scrollLeft !== before.left || grid.scrollTop !== before.top) {
    // makeVisibleCell only updates the DOM scroll position; the grid
    // state used by getCellRelativeRect is updated by the asynchronous
    // scroll event, so wait for it.
    await new Promise<void>((resolve) => {
      const id = grid.listen("scroll", () => {
        grid.unlisten(id);
        resolve();
      });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          grid.unlisten(id);
          resolve();
        })
      );
    });
  }
  const rect = grid.getCellRelativeRect(col, row);
  const canvasRect = grid.canvas.getBoundingClientRect();
  return {
    x: canvasRect.left + rect.left,
    y: canvasRect.top + rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** The viewport rectangle of a cell. */
export interface CellRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates a {@link CheetahGridLocator} that drives the Cheetah Grid found
 * at the given locator. The locator may point at the grid root element
 * (`.cheetah-grid`), any element inside the grid, or an ancestor element
 * containing the grid.
 *
 * The page must expose the cheetahGrid namespace as `window.cheetahGrid`.
 * The UMD bundle defines it automatically; applications bundling the ES
 * module must expose it themselves (e.g. `window.cheetahGrid = cheetahGrid`).
 */
export function gridLocator(locator: Locator): CheetahGridLocator {
  return new CheetahGridLocator(locator);
}

export class CheetahGridLocator {
  readonly locator: Locator;
  constructor(locator: Locator) {
    this.locator = locator;
  }
  get page(): Page {
    return this.locator.page();
  }
  /**
   * Returns a cell locator for the given field and record index.
   */
  cell(field: string, index: number): CheetahGridCellLocator {
    return new CheetahGridCellLocator(this, {
      type: "gridCell",
      field,
      index,
    });
  }
  /**
   * Returns a cell locator for the given raw column and row indices
   * (including header rows).
   */
  cellAt(col: number, row: number): CheetahGridCellLocator {
    return new CheetahGridCellLocator(this, { type: "cell", col, row });
  }
}

export class CheetahGridCellLocator {
  private readonly _grid: CheetahGridLocator;
  private readonly _spec: CellSpec;
  constructor(grid: CheetahGridLocator, spec: CellSpec) {
    this._grid = grid;
    this._spec = spec;
  }
  /**
   * Scrolls the grid to make the cell visible and returns the viewport
   * rectangle of the cell.
   */
  rect(): Promise<CellRect> {
    return this._grid.locator.evaluate(cellOperation, {
      spec: this._spec,
      op: "rect" as const,
    }) as Promise<CellRect>;
  }
  /**
   * Returns the value of the cell. If the record has not been loaded yet,
   * the value is awaited. For header cells, returns the caption.
   */
  value(): Promise<unknown> {
    return this._grid.locator.evaluate(cellOperation, {
      spec: this._spec,
      op: "value" as const,
    });
  }
  /**
   * Clicks the center of the cell with a real mouse event, scrolling the
   * grid to make the cell visible first.
   */
  async click(): Promise<void> {
    const rect = await this.rect();
    await this._grid.page.mouse.click(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2
    );
  }
  /**
   * Double-clicks the center of the cell with real mouse events, scrolling
   * the grid to make the cell visible first.
   */
  async dblclick(): Promise<void> {
    const rect = await this.rect();
    await this._grid.page.mouse.dblclick(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2
    );
  }
  /**
   * Replaces the value of an editable cell: selects the cell, opens the
   * editor with F2, fills the focused editor input, and commits with Enter.
   */
  async fill(value: string): Promise<void> {
    const { page } = this._grid;
    await this.click();
    await page.keyboard.press("F2");
    // The cell editors ignore Enter for one macrotask after opening.
    // The page's pending timeout runs before this one (FIFO), so after
    // this wait the editor accepts the commit.
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve);
        })
    );
    await page.locator("input:focus").fill(value);
    await page.keyboard.press("Enter");
  }
}

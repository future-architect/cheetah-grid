import type { Locator, Page } from "playwright-core";
import type * as cheetahGridNamespace from "cheetah-grid";

type CheetahGridNamespace = typeof cheetahGridNamespace;

/**
 * How the target cell is specified: by the field and record index
 * (`gridCell`), or by raw column/row indices including headers (`cell`).
 */
type CellSpec =
  | { type: "gridCell"; field: string; index: number }
  | { type: "cell"; col: number; row: number };

/** Result of {@link cellOperation}, keyed by the operation. */
interface CellOperationResults {
  rect: CellRect;
  _evaluateClickPoint: { x: number; y: number };
  value: unknown;
}

/**
 * Runs an operation on a cell.
 * NOTE: This function is serialized and executed in the page context, so
 * it must be self-contained. Helper functions are declared inside it so
 * that they are serialized together with it.
 */
async function cellOperation<OP extends keyof CellOperationResults>(
  el: SVGElement | HTMLElement,
  arg: { spec: CellSpec; op: OP }
): Promise<CellOperationResults[OP]>;
async function cellOperation(
  el: SVGElement | HTMLElement,
  { spec, op }: { spec: CellSpec; op: keyof CellOperationResults }
): Promise<unknown> {
  // Get the grid instance associated with the element, and the column and row of the cell.
  const grid = resolveGrid();
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
  if (col < 0 || grid.colCount <= col || row < 0 || grid.rowCount <= row) {
    const target =
      spec.type === "gridCell"
        ? `field=${spec.field}, index=${spec.index}`
        : `col=${col}, row=${row}`;
    throw new Error(`Cell out of range: ${target}`);
  }

  // Perform the requested operation.
  if (op === "value") {
    return grid.getCellValue(col, row);
  }
  if (op === "rect" || op === "_evaluateClickPoint") {
    await scrollCellIntoView();
    const frameOffset = getFrameOffset();
    // For merged (colSpan/rowSpan) cells, return the whole merged
    // rectangle rather than the anchor cell slice.
    const range = grid.getCellRange(col, row);
    const startRect = grid.getCellRelativeRect(
      range.start.col,
      range.start.row
    );
    const endRect =
      range.start.col === range.end.col && range.start.row === range.end.row
        ? startRect
        : grid.getCellRelativeRect(range.end.col, range.end.row);
    const rect = {
      left: startRect.left,
      top: startRect.top,
      width: endRect.left + endRect.width - startRect.left,
      height: endRect.top + endRect.height - startRect.top,
    };
    const canvasRect = grid.canvas.getBoundingClientRect();
    // The grid's own mouse hit-testing does not compensate for visual
    // scaling either, so scaled grids cannot be operated by coordinates.
    if (
      Math.abs(canvasRect.width / grid.canvas.offsetWidth - 1) > 0.01 ||
      Math.abs(canvasRect.height / grid.canvas.offsetHeight - 1) > 0.01
    ) {
      throw new Error(
        "The grid is scaled by an ancestor transform or zoom, which is not supported."
      );
    }
    if (op === "rect") {
      return {
        x: frameOffset.x + canvasRect.left + rect.left,
        y: frameOffset.y + canvasRect.top + rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    // The click point: the center of the visible part of the cell. The center
    // of the whole rectangle can fall outside the canvas when the cell
    // is larger than the grid viewport (e.g. a column wider than the
    // grid), and mouse events outside the canvas hit nothing.
    const left = Math.max(rect.left, 0);
    const top = Math.max(rect.top, 0);
    const right = Math.min(rect.left + rect.width, canvasRect.width);
    const bottom = Math.min(rect.top + rect.height, canvasRect.height);
    if (right <= left || bottom <= top) {
      throw new Error("The cell is outside the visible area of the grid.");
    }
    return {
      x: frameOffset.x + canvasRect.left + (left + right) / 2,
      y: frameOffset.y + canvasRect.top + (top + bottom) / 2,
    };
  }

  throw new Error(`Invalid cell operation: ${String(op)}`);

  /**
   * Gets the grid instance associated with the element.
   */
  function resolveGrid() {
    const ns = (window as unknown as { cheetahGrid?: CheetahGridNamespace })
      .cheetahGrid;
    if (!ns) {
      throw new Error(
        '"window.cheetahGrid" is not defined. Expose the cheetahGrid namespace for automation (e.g. `window.cheetahGrid = cheetahGrid`).'
      );
    }
    let grid = ns.ListGrid.getInstanceByElement(el);
    if (!grid) {
      // The element is not inside a grid; find the grid under it. Never
      // pick one of several silently — operating on the wrong grid only
      // shows up as confusing wrong-cell failures.
      const inners = el.querySelectorAll(".cheetah-grid");
      if (inners.length > 1) {
        throw new Error(
          `The element contains ${inners.length} grids. Use a locator that identifies a single grid.`
        );
      }
      if (inners.length === 1) {
        grid = ns.ListGrid.getInstanceByElement(inners[0]);
      }
    }
    if (!grid) {
      throw new Error("No ListGrid instance is associated with the element.");
    }
    return grid;
  }
  /**
   * Scrolls the grid so that the cell is inside the grid's own viewport,
   * and waits until the grid's internal scroll state catches up.
   */
  async function scrollCellIntoView(): Promise<void> {
    const before = { left: grid.scrollLeft, top: grid.scrollTop };
    // Force instant scrolling while adjusting the grid's scroll
    // position: under `scroll-behavior: smooth` the programmatic scroll
    // of makeVisibleCell animates, so the position (which the wait
    // below and the returned coordinates are based on) would still be
    // the old one when this function returns. An automation helper
    // should not wait for the cosmetic animation either.
    const scrollable = grid
      .getElement()
      .querySelector<HTMLElement>(".grid-scrollable");
    const behavior = scrollable?.style.getPropertyValue("scroll-behavior");
    const behaviorPriority =
      scrollable?.style.getPropertyPriority("scroll-behavior");
    scrollable?.style.setProperty("scroll-behavior", "auto", "important");
    grid.makeVisibleCell(col, row);
    if (scrollable) {
      if (behavior) {
        scrollable.style.setProperty(
          "scroll-behavior",
          behavior,
          behaviorPriority
        );
      } else {
        scrollable.style.removeProperty("scroll-behavior");
      }
    }
    if (grid.scrollLeft === before.left && grid.scrollTop === before.top) {
      return;
    }
    // makeVisibleCell only updates the DOM scroll position; the grid
    // state used by getCellRelativeRect is updated by the asynchronous
    // scroll event, so wait for it.
    await new Promise<void>((resolve) => {
      // Settle exactly once: both paths below reach here, and the
      // grid's unlisten() is not idempotent (a second call throws).
      let settled = false;
      const settle = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        grid.unlisten(id);
        resolve();
      };
      const id = grid.listen("scroll", settle);
      // Fallback in case no scroll event arrives. Scroll events are
      // processed before animation frame callbacks in the rendering
      // steps, so a pending scroll event always wins this race.
      requestAnimationFrame(() => requestAnimationFrame(settle));
    });
  }
  /**
   * Returns the total offset of the ancestor frame elements. The mouse
   * operates in the top-level viewport while getBoundingClientRect is
   * relative to this frame's viewport.
   */
  function getFrameOffset(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    for (let win: Window = window; win !== win.parent; win = win.parent) {
      const { frameElement } = win;
      if (!frameElement) {
        throw new Error(
          "The grid is inside a cross-origin iframe, which is not supported."
        );
      }
      const frameRect = frameElement.getBoundingClientRect();
      const frameStyle = win.parent.getComputedStyle(frameElement);
      x +=
        frameRect.left +
        frameElement.clientLeft +
        parseFloat(frameStyle.paddingLeft);
      y +=
        frameRect.top +
        frameElement.clientTop +
        parseFloat(frameStyle.paddingTop);
    }
    return { x, y };
  }
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
   * Locator of the grid root element (`.cheetah-grid`), resolved from the
   * given locator whether it points at the root itself, an element inside
   * the grid, or an ancestor element. Stays in the locator's own frame.
   */
  get rootLocator(): Locator {
    return this.locator
      .locator(
        "xpath=ancestor-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' cheetah-grid ')]"
      )
      .or(this.locator.locator(".cheetah-grid"));
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
    return this._grid.locator.evaluate(cellOperation<"rect">, {
      spec: this._spec,
      op: "rect" as const,
    });
  }
  /**
   * Returns the value of the cell. If the record has not been loaded yet,
   * the value is awaited. For header cells, returns the caption.
   */
  value(): Promise<unknown> {
    return this._grid.locator.evaluate(cellOperation<"value">, {
      spec: this._spec,
      op: "value" as const,
    });
  }
  /**
   * Returns the viewport point to click: the center of the visible part
   * of the cell (a cell larger than the grid viewport is only partially
   * on the canvas, and mouse events outside the canvas hit nothing). Scrolls
   * the window (and ancestor frames) so that the grid is in view first —
   * the grid only scrolls its own viewport internally — and fails clearly
   * when the point still lies outside the window viewport (mouse events
   * outside the viewport hit nothing, silently).
   */
  private async _clickPoint(): Promise<{ x: number; y: number }> {
    await this._grid.rootLocator.scrollIntoViewIfNeeded();
    let point = await this._evaluateClickPoint();
    const viewport = this._grid.page.viewportSize();
    if (
      viewport &&
      (point.x < 0 ||
        viewport.width < point.x ||
        point.y < 0 ||
        viewport.height < point.y)
    ) {
      // The grid is in view but the cell is not, e.g. when the grid
      // element itself is larger than the window viewport
      // (scrollIntoViewIfNeeded does nothing once any part of the grid
      // is visible). Scroll the window to bring the point around the
      // center of the viewport, and recompute.
      await this._grid.page.evaluate(
        ([scrollX, scrollY]) => {
          window.scrollBy(scrollX, scrollY);
        },
        [point.x - viewport.width / 2, point.y - viewport.height / 2]
      );
      point = await this._evaluateClickPoint();
      if (
        point.x < 0 ||
        viewport.width < point.x ||
        point.y < 0 ||
        viewport.height < point.y
      ) {
        throw new Error(
          `The cell's click point (${point.x}, ${point.y}) is outside the window viewport (${viewport.width}x${viewport.height}).`
        );
      }
    }
    return point;
  }
  private _evaluateClickPoint(): Promise<{ x: number; y: number }> {
    return this._grid.locator.evaluate(cellOperation<"_evaluateClickPoint">, {
      spec: this._spec,
      op: "_evaluateClickPoint" as const,
    });
  }
  /**
   * Clicks the center of the cell with a real mouse event, scrolling the
   * grid to make the cell visible first.
   */
  async click(): Promise<void> {
    const point = await this._clickPoint();
    await this._grid.page.mouse.click(point.x, point.y);
  }
  /**
   * Double-clicks the center of the cell with real mouse events, scrolling
   * the grid to make the cell visible first.
   */
  async dblclick(): Promise<void> {
    const point = await this._clickPoint();
    await this._grid.page.mouse.dblclick(point.x, point.y);
  }
  /**
   * Replaces the value of an editable cell: selects the cell, opens the
   * editor with F2, fills the focused editor input, and commits with Enter.
   */
  async fill(value: string): Promise<void> {
    const { page } = this._grid;
    // Load the record first; the editor cannot open while it is loading.
    await this.value();
    // Select the cell with a real click, then open its editor with F2
    // (pre-filled with the current value).
    await this.click();
    await page.keyboard.press("F2");
    // The cell editors ignore Enter for one macrotask after opening.
    // The grid frame's pending timeout runs before this one (FIFO), so
    // after this wait the editor accepts the commit.
    await this._grid.locator.evaluate(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve);
        })
    );
    // The editor element is attached inside the grid root element. The
    // grid's own hidden focus control is excluded: it is the focused
    // (and editable) element whenever no editor is open, so without the
    // exclusion the value would be silently typed into it.
    const editorInput = this._grid.rootLocator.locator(
      "input:focus:not(.grid-focus-control)"
    );
    if ((await editorInput.count()) === 0) {
      // No editor opened. Menu editors open their menu on the single
      // click above and trap the focus on a menu item; close it so that
      // the failed fill() does not affect subsequent operations.
      await page.keyboard.press("Escape");
      throw new Error(
        "The cell editor did not open. The cell may not be editable, or its editor may not be a text input."
      );
    }
    await editorInput.fill(value);
    await page.keyboard.press("Enter");
    // Enter does not guarantee a commit: when a validator rejects the
    // value (possibly asynchronously), the value stays unchanged and the
    // editor stays open. Poll until the outcome is known and resolve with
    // the validation message, or null on success.
    const errorMessage = await this._grid.rootLocator.evaluate(
      (root) =>
        new Promise<string | null>((resolve, reject) => {
          const startTime = Date.now();
          const check = (): void => {
            // Special-case handling for the built-in
            // SmallDialogInputEditor, the only built-in editor that
            // supports validators (`inputValidator`/`validator`; the
            // string action "input" also maps to this editor). When a
            // validator rejects the value, the dialog stays open: the
            // dialog element always remains in the DOM with its
            // visibility expressed only by the "--shown"/"--hidden"
            // state classes, and it exposes the validation message as
            // data-error-message. The other built-in text editor
            // (InlineInputEditor) has no validators, and rejections by
            // custom editors cannot be detected here — those resolve via
            // the focus check below or hit the timeout.
            const dialog = root.querySelector<HTMLElement>(
              ".cheetah-grid__small-dialog-input--shown"
            );
            const message = dialog?.dataset.errorMessage;
            if (message) {
              resolve(message);
              return;
            }
            // On a successful commit the editor closes and the grid
            // moves the focus back to its own focus control.
            const active = root.ownerDocument.activeElement;
            if (
              !active ||
              !root.contains(active) ||
              active.classList.contains("grid-focus-control")
            ) {
              resolve(null);
              return;
            }
            if (Date.now() - startTime > 30000) {
              reject(new Error("The cell value was not committed."));
              return;
            }
            setTimeout(check, 16);
          };
          check();
        })
    );
    if (errorMessage !== null) {
      // Cancel the editing so that the dialog does not stay open.
      await page.keyboard.press("Escape");
      throw new Error(`The cell value was not committed: ${errorMessage}`);
    }
  }
}

import type {
  CellAddress,
  InlineInputEditorOption,
  ListGridAPI,
} from "../../ts-types";
import type { GridInternal, InputEditorState } from "../../ts-types-internal";
import { BaseInputEditor } from "./BaseInputEditor";
import { InlineInputElement } from "./internal/InlineInputElement";
import { getInlineInputEditorStateId } from "../../internal/symbolManager";
import { obj } from "../../internal/utils";
const _ = getInlineInputEditorStateId();

function getState<T>(grid: GridInternal<T>): InputEditorState {
  let state = grid[_];
  if (!state) {
    state = {};
    obj.setReadonly(grid, _, state);
  }
  return state;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalElement: InlineInputElement<any> | null = null;
let bindGridCount = 0;
function attachInput<T>(
  grid: GridInternal<T>,
  cell: CellAddress,
  editor: InlineInputEditor<T>,
  value: string
): void {
  const state = getState(grid);
  if (!globalElement) {
    globalElement = new InlineInputElement();
  }
  if (!state.element) {
    state.element = globalElement;
    bindGridCount++;
    grid.addDisposable({
      dispose() {
        bindGridCount--;
        if (!bindGridCount) {
          globalElement?.dispose();
          globalElement = null;
          state.element = null;
        }
      },
    });
  }

  globalElement.attach(grid, editor, cell.col, cell.row, value);
}
function detachInput(gridFocus?: boolean): void {
  if (globalElement) {
    globalElement.detach(gridFocus);
  }
}
function doChangeValue<T>(_grid: ListGridAPI<T>): void {
  if (globalElement) {
    globalElement.doChangeValue();
  }
}

export class InlineInputEditor<T> extends BaseInputEditor<T> {
  private _classList?: string | string[];
  private _type?: string;
  constructor(option: InlineInputEditorOption = {}) {
    super(option);
    this._classList = option.classList;
    this._type = option.type;
  }
  get classList(): string[] | undefined {
    if (!this._classList) {
      return undefined;
    }
    return Array.isArray(this._classList) ? this._classList : [this._classList];
  }
  set classList(classList: string[] | undefined) {
    this._classList = classList;
  }
  get type(): string | undefined {
    return this._type;
  }
  set type(type: string | undefined) {
    this._type = type;
  }
  clone(): InlineInputEditor<T> {
    return new InlineInputEditor(this);
  }
  onInputCellInternal(
    grid: ListGridAPI<T>,
    cell: CellAddress,
    inputValue: string
  ): void {
    attachInput(grid, cell, this, inputValue);
  }
  onOpenCellInternal(grid: ListGridAPI<T>, cell: CellAddress): void {
    grid.doGetCellValue(cell.col, cell.row, (value) => {
      attachInput(grid, cell, this, value);
    });
  }
  onChangeSelectCellInternal(
    grid: ListGridAPI<T>,
    _cell: CellAddress,
    _selected: boolean
  ): void {
    doChangeValue(grid);
    detachInput();
  }
  onGridScrollInternal(grid: ListGridAPI<T>): void {
    doChangeValue(grid);
    detachInput(true);
  }
  onChangeDisabledInternal(): void {
    // cancel input
    detachInput(true);
  }
  onChangeReadOnlyInternal(): void {
    // cancel input
    detachInput(true);
  }
  onSetInputAttrsInternal(
    grid: ListGridAPI<T>,
    _cell: CellAddress,
    input: HTMLInputElement
  ): void {
    InlineInputElement.setInputAttrs(this, grid, input);
  }
}

import { BaseAction } from "./BaseAction";
import { EditorOption } from "../../ts-types";
export abstract class Editor<T> extends BaseAction<T> {
  protected _readOnly: boolean;
  constructor(option: EditorOption = {}) {
    super(option);
    this._readOnly = option.readOnly || false;
  }
  get editable(): boolean {
    return true;
  }
  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(readOnly) {
    this._readOnly = !!readOnly;
    this.onChangeReadOnlyInternal();
  }
  onChangeReadOnlyInternal(): void {
    // abstruct
  }
}

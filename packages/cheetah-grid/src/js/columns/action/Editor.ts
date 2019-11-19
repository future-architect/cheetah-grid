import { BaseAction } from "./BaseAction";
import { EditorOption } from "../../ts-types";
export class Editor<T> extends BaseAction<T> {
  protected _readOnly: boolean;
  constructor(option: EditorOption = {}) {
    super(option);
    this._readOnly = option.readOnly || false;
  }
  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(readOnly) {
    this._readOnly = !!readOnly;
    this.onChangeReadOnlyInternal();
  }
  clone(): Editor<T> {
    return new Editor(this);
  }
  onChangeReadOnlyInternal(): void {
    // abstruct
  }
}

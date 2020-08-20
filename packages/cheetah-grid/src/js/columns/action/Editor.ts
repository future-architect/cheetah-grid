import type { EditorOption, RecordBoolean } from "../../ts-types";
import { BaseAction } from "./BaseAction";
export abstract class Editor<T> extends BaseAction<T> {
  protected _readOnly: RecordBoolean;
  constructor(option: EditorOption = {}) {
    super(option);
    this._readOnly = option.readOnly || false;
  }
  get editable(): boolean {
    return true;
  }
  get readOnly(): RecordBoolean {
    return this._readOnly;
  }
  set readOnly(readOnly: RecordBoolean) {
    this._readOnly = readOnly;
    this.onChangeReadOnlyInternal();
  }
  onChangeReadOnlyInternal(): void {
    // abstruct
  }
}

import type {
  ActionOption,
  BaseActionOption,
  ButtonActionOption,
  ColumnActionOption,
  EditorOption,
  InlineInputEditorOption,
  InlineMenuEditorOption,
  RecordBoolean,
  SmallDialogInputEditorOption,
} from "../ts-types";
import { Action } from "./action/Action";
import { BaseAction } from "./action/BaseAction";
import { ButtonAction } from "./action/ButtonAction";
import { CheckEditor } from "./action/CheckEditor";
import { Editor } from "./action/Editor";
import { InlineInputEditor } from "./action/InlineInputEditor";
import { InlineMenuEditor } from "./action/InlineMenuEditor";
import { RadioEditor } from "./action/RadioEditor";
import { SmallDialogInputEditor } from "./action/SmallDialogInputEditor";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ImmutableCheckEditor extends CheckEditor<any> {
  get disabled(): RecordBoolean {
    return this._disabled;
  }
  get readOnly(): RecordBoolean {
    return this._readOnly;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ImmutableRadioEditor extends RadioEditor<any> {
  get disabled(): RecordBoolean {
    return this._disabled;
  }
  get readOnly(): RecordBoolean {
    return this._readOnly;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ImmutableInputEditor extends SmallDialogInputEditor<any> {
  get disabled(): RecordBoolean {
    return this._disabled;
  }
  get readOnly(): RecordBoolean {
    return this._readOnly;
  }
}

export const ACTIONS = {
  CHECK: new ImmutableCheckEditor(),
  INPUT: new ImmutableInputEditor(),
  RADIO: new ImmutableRadioEditor(),
};
/**
 * column actions
 * @namespace cheetahGrid.columns.action
 * @memberof cheetahGrid.columns
 */
export {
  BaseAction,
  Editor,
  Action,
  CheckEditor,
  RadioEditor,
  ButtonAction,
  SmallDialogInputEditor,
  InlineInputEditor,
  InlineMenuEditor,
};
export type {
  ActionOption,
  BaseActionOption,
  ButtonActionOption,
  EditorOption,
  InlineInputEditorOption,
  InlineMenuEditorOption,
  SmallDialogInputEditorOption,
};
export function of<T>(
  columnAction: ColumnActionOption | BaseAction<T> | null | undefined
): BaseAction<T> | undefined {
  if (!columnAction) {
    return undefined;
  } else if (typeof columnAction === "string") {
    const key = columnAction.toUpperCase() as keyof typeof ACTIONS;
    return ACTIONS[key] || of(null);
  } else {
    return columnAction;
  }
}

import * as cheetahGrid from "cheetah-grid";

export type BaseHeaderProps<T> = {
  caption?: string | (() => string);
  children?: string;
  headerField?: string;
  headerStyle?:
    | cheetahGrid.TYPES.HeaderStyleOption
    | cheetahGrid.columns.style.BaseStyle
    | null;
  headerType?:
    | "DEFAULT"
    | "default"
    | "SORT"
    | "sort"
    | "CHECK"
    | "check"
    | "multilinetext"
    | "MULTILINETEXT";
  headerAction?: "CHECK" | "check" | "SORT" | "sort";
  sort?: cheetahGrid.TYPES.OldSortOption<T>;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;

  colSpan?: number;
  rowSpan?: number;
};

export type ProcessedBaseHeaderProps<T> = Omit<BaseHeaderProps<T>, "children">;

export function processBaseHeaderProps<T>(
  props: BaseHeaderProps<T>
): ProcessedBaseHeaderProps<T> {
  const {
    children,
    caption,
    headerField,
    headerStyle,
    headerType,
    headerAction,
    sort,
    width,
    minWidth,
    maxWidth,
    colSpan,
    rowSpan,
  } = props;
  return {
    caption: caption ? caption : children ? children : "",
    headerField,
    headerStyle,
    headerType,
    headerAction,
    width,
    minWidth,
    maxWidth,
    sort,
    colSpan,
    rowSpan,
  };
}

export type StandardProps<T> = BaseHeaderProps<T> &
  WithMessageProps<T> & {
    icon?:
      | cheetahGrid.TYPES.ColumnIconOption<T>
      | cheetahGrid.TYPES.ColumnIconOption<T>[];
  };

export type WithMessageProps<T> = {
  message?:
    | cheetahGrid.TYPES.Message
    | ((record: T) => cheetahGrid.TYPES.Message | null)
    | keyof T
    | (
        | cheetahGrid.TYPES.Message
        | ((record: T) => cheetahGrid.TYPES.Message | null)
        | keyof T
      )[];
};

export type WithFieldProps<T> = {
  field: keyof T;
};

type OnClick<T> = {
  disabled?: boolean;
  onClick?: (row: T) => void;
};

export function isOnClick<T>(value: {}): value is OnClick<T> {
  return "OnClick" in value;
}

export type WithOnClick<T> = OnClick<T>;

export function parseOnClick<T>(
  props: OnClick<T>
): cheetahGrid.columns.action.BaseAction<T> | undefined {
  let action: cheetahGrid.columns.action.BaseAction<T> | undefined;
  const { onClick, disabled } = props;

  if (onClick) {
    action = new cheetahGrid.columns.action.Action({
      disabled,
      action(rec) {
        if (onClick) {
          onClick(rec);
        }
      },
    });
  }
  return action;
}

type TextEditProps = {
  disabled?: boolean;
  editable?: boolean | "inline" | "popup" | "";
};

export type WithTextEditProps<T> = TextEditProps | OnClick<T>;

// both disabled and editable are optional, so this is always true
function isTextEdit(value: unknown): value is TextEditProps {
  return true;
}

export function parseEditorEditable<T>(
  props: WithTextEditProps<T>
): cheetahGrid.columns.action.BaseAction<T> | undefined {
  let action: cheetahGrid.columns.action.BaseAction<T> | undefined;
  if (isOnClick(props)) {
    action = parseOnClick<T>(props);
  } else if (isTextEdit(props)) {
    const { editable, disabled } = props;
    if (editable === true || editable === "inline") {
      action = new cheetahGrid.columns.action.InlineInputEditor<T>({
        disabled,
      });
    } else if (editable === "popup") {
      action = new cheetahGrid.columns.action.SmallDialogInputEditor<T>({
        disabled,
      });
    }
  }
  return action;
}

type WidgetEditableProps = {
  disabled?: boolean;
  editable?: boolean;
};

export type WithWidgetEditableProps<T> = OnClick<T> | WidgetEditableProps;

export function parseWidgetEditable<T>(
  widget: "checkbox" | "radio",
  props: WithWidgetEditableProps<T>
) {
  let action: cheetahGrid.columns.action.BaseAction<T> | undefined;
  if (isOnClick(props)) {
    action = parseOnClick<T>(props);
  } else {
    let editable = false;
    let disabled = false;
    if (isWidgetEditableProps<T>(props)) {
      editable = Boolean(props.editable);
      disabled = Boolean(props.disabled);
    }
    switch (widget) {
      case "checkbox":
        action = new cheetahGrid.columns.action.CheckEditor<T>({
          disabled,
          readOnly: !editable,
        });
        break;
      case "radio":
        action = new cheetahGrid.columns.action.RadioEditor<T>({
          disabled,
          readOnly: !editable,
        });
        break;
    }
  }
  return action;
}

// both disabled and editable are optional, so this is always true
export function isWidgetEditableProps<T>(
  value: unknown
): value is WidgetEditableProps {
  return true;
}

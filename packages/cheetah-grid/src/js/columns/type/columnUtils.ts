import * as icons from "../../internal/icons";
import type {
  CellContext,
  ColumnIconOption,
  GridCanvasHelperAPI,
  MaybePromise,
} from "../../ts-types";
import type { SimpleColumnIconOption } from "../../ts-types-internal";
import { isPromise } from "../../internal/utils";

export function loadIcons(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: MaybePromise<ColumnIconOption<any> | ColumnIconOption<any>[]> | null,
  context: CellContext,
  helper: GridCanvasHelperAPI,
  callback: (
    icons: SimpleColumnIconOption[] | undefined,
    context: CellContext
  ) => void
): void {
  let argIcon = undefined;
  if (icon) {
    if (isPromise(icon)) {
      icon.then((i) => {
        loadIcons(i, context.toCurrentContext(), helper, callback);
      });
    } else {
      const iconList = icons.toNormarizeArray(icon);
      iconList.forEach((i) => {
        if (i.font && i.content) {
          helper.testFontLoad(i.font, i.content, context);
        }
      });
      argIcon = iconList;
    }
  }
  callback(argIcon, context);
}

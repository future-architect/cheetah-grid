/*eslint no-bitwise:0*/

import { StylePropertyFunctionArg, ThemeDefine } from "../ts-types";

function FROZEN_ROWS_BORDER_COLOR(args: StylePropertyFunctionArg): string[] {
  const {
    row,
    grid: { frozenRowCount }
  } = args;
  if (frozenRowCount - 1 === row) {
    return ["#f2f2f2", "#f2f2f2", "#ccc7c7", "#f2f2f2"];
  } else {
    return ["#f2f2f2"];
  }
}
function BORDER_COLOR(args: StylePropertyFunctionArg): (string | null)[] {
  const {
    col,
    grid: { colCount, frozenColCount }
  } = args;
  if (frozenColCount - 1 === col) {
    return ["#ccc7c7", "#f2f2f2", "#ccc7c7", null];
  }
  if (colCount - 1 === col) {
    return ["#ccc7c7", "#f2f2f2", "#ccc7c7", null];
  }
  return ["#ccc7c7", null];
}
/**
 * material design theme
 * @name MATERIAL_DESIGN
 * @type {Object}
 * @memberof cheetahGrid.themes.choices
 */
export default {
  color: "rgba(0, 0, 0, 0.87)",
  frozenRowsColor: "rgba(0, 0, 0, 0.54)",

  defaultBgColor: "#FFF",
  // frozenRowsBgColor: '#FFF',
  selectionBgColor: "#CCE0FF",

  borderColor: BORDER_COLOR,
  frozenRowsBorderColor: FROZEN_ROWS_BORDER_COLOR,
  highlightBorderColor: "#5E9ED6",

  checkbox: {
    // uncheckBgColor: '#FFF',
    checkBgColor: "rgb(76, 73, 72)",
    borderColor: "rgba(0, 0, 0, 0.26)"
  },
  button: {
    color: "#FFF",
    bgColor: "#2196F3"
  },
  header: {
    sortArrowColor: "rgba(0, 0, 0, 0.38)"
  },
  underlayBackgroundColor: "#FFF"
} as ThemeDefine;

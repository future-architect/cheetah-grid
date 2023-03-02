/*eslint no-bitwise:0*/

import type { StylePropertyFunctionArg, ThemeDefine } from "../ts-types";

function FROZEN_ROWS_BORDER_COLOR(args: StylePropertyFunctionArg): string[] {
  const {
    row,
    grid: { frozenRowCount },
  } = args;
  if (frozenRowCount - 1 === row) {
    return ["#f2f2f2", "#f2f2f2", "#ccc7c7", "#f2f2f2"];
  } else {
    return ["#f2f2f2"];
  }
}
function BORDER_COLOR(args: StylePropertyFunctionArg): (string | null)[] {
  const { col, row, grid } = args;
  const { colCount, frozenColCount, recordRowCount } = grid;
  let top: string | null = "#ccc7c7";
  let bottom: string | null = "#ccc7c7";
  if (recordRowCount > 1) {
    const startRow = grid.getRecordStartRowByRecordIndex(
      grid.getRecordIndexByRow(row)
    );
    const endRow = startRow + recordRowCount - 1;
    if (startRow !== row) {
      top = null;
    }
    if (endRow !== row) {
      bottom = null;
    }
  }
  if (frozenColCount - 1 === col) {
    return [top, "#f2f2f2", bottom, null];
  }
  if (colCount - 1 === col) {
    return [top, "#f2f2f2", bottom, null];
  }

  return [top, null, bottom, null];
}
/**
 * material design theme
 * @name MATERIAL_DESIGN
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
    borderColor: "rgba(0, 0, 0, 0.26)",
  },
  radioButton: {
    checkColor: "rgb(76, 73, 72)",
    checkBorderColor: "rgb(76, 73, 72)",
    uncheckBorderColor: "rgb(189, 189, 189)",
    // uncheckBgColor: "#FFF",
    // checkBgColor: "#FFF",
  },
  button: {
    color: "#FFF",
    bgColor: "#2196F3",
  },
  header: {
    sortArrowColor: "rgba(0, 0, 0, 0.38)",
  },
  indicators: {
    topLeftColor: "#ccc7c7",
  },
  underlayBackgroundColor: "#FFF",
} as ThemeDefine;

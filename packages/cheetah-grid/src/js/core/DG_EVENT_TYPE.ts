export interface DrawGridEvents {
  /**
   * Indicates when the cell was clicked.
   */
  CLICK_CELL: "click_cell";
  /**
   * Indicates when the cell was double-clicked.
   */
  DBLCLICK_CELL: "dblclick_cell";
  /**
   * Indicates when the cell was double-taped.
   */
  DBLTAP_CELL: "dbltap_cell";
  /**
   * Indicates when pointing device button is pressed in a cell.
   */
  MOUSEDOWN_CELL: "mousedown_cell";
  /**
   * Indicates when pointing device button is released in a cell.
   */
  MOUSEUP_CELL: "mouseup_cell";
  /**
   * Indicates the cell selection state has changed.
   */
  SELECTED_CELL: "selected_cell";
  /**
   * Indicates key-downed.
   */
  KEYDOWN: "keydown";
  MOUSEMOVE_CELL: "mousemove_cell";
  MOUSEENTER_CELL: "mouseenter_cell";
  MOUSELEAVE_CELL: "mouseleave_cell";
  MOUSEOVER_CELL: "mouseover_cell";
  MOUSEOUT_CELL: "mouseout_cell";
  /**
   * Indicates when the user attempts to open a context menu in the cell.
   */
  CONTEXTMENU_CELL: "contextmenu_cell";
  INPUT_CELL: "input_cell";
  PASTE_CELL: "paste_cell";
  DELETE_CELL: "delete_cell";
  EDITABLEINPUT_CELL: "editableinput_cell";
  MODIFY_STATUS_EDITABLEINPUT_CELL: "modify_status_editableinput_cell";
  /**
   * Indicates when the column width has changed.
   */
  RESIZE_COLUMN: "resize_column";
  /**
   * Indicates when scrolled.
   */
  SCROLL: "scroll";
  FOCUS_GRID: "focus_grid";
  BLUR_GRID: "blur_grid";
}
/**
 * DrawGrid event types
 * @classdesc cheetahGrid.core.EVENT_TYPE
 * @memberof cheetahGrid.core
 */
export const DG_EVENT_TYPE: DrawGridEvents = {
  CLICK_CELL: "click_cell",
  DBLCLICK_CELL: "dblclick_cell",
  DBLTAP_CELL: "dbltap_cell",
  MOUSEDOWN_CELL: "mousedown_cell",
  MOUSEUP_CELL: "mouseup_cell",
  SELECTED_CELL: "selected_cell",
  KEYDOWN: "keydown",
  MOUSEMOVE_CELL: "mousemove_cell",
  MOUSEENTER_CELL: "mouseenter_cell",
  MOUSELEAVE_CELL: "mouseleave_cell",
  MOUSEOVER_CELL: "mouseover_cell",
  MOUSEOUT_CELL: "mouseout_cell",
  CONTEXTMENU_CELL: "contextmenu_cell",
  INPUT_CELL: "input_cell",
  PASTE_CELL: "paste_cell",
  DELETE_CELL: "delete_cell",
  EDITABLEINPUT_CELL: "editableinput_cell",
  MODIFY_STATUS_EDITABLEINPUT_CELL: "modify_status_editableinput_cell",
  RESIZE_COLUMN: "resize_column",
  SCROLL: "scroll",
  FOCUS_GRID: "focus_grid",
  BLUR_GRID: "blur_grid",
} as DrawGridEvents;

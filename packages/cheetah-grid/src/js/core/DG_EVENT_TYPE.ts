export interface DrawGridEvents {
  CLICK_CELL: "click_cell";
  DBLCLICK_CELL: "dblclick_cell";
  DBLTAP_CELL: "dbltap_cell";
  MOUSEDOWN_CELL: "mousedown_cell";
  MOUSEUP_CELL: "mouseup_cell";
  SELECTED_CELL: "selected_cell";
  KEYDOWN: "keydown";
  MOUSEMOVE_CELL: "mousemove_cell";
  MOUSEENTER_CELL: "mouseenter_cell";
  MOUSELEAVE_CELL: "mouseleave_cell";
  MOUSEOVER_CELL: "mouseover_cell";
  MOUSEOUT_CELL: "mouseout_cell";
  INPUT_CELL: "input_cell";
  PASTE_CELL: "paste_cell";
  EDITABLEINPUT_CELL: "editableinput_cell";
  MODIFY_STATUS_EDITABLEINPUT_CELL: "modify_status_editableinput_cell";
  RESIZE_COLUMN: "resize_column";
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
  INPUT_CELL: "input_cell",
  PASTE_CELL: "paste_cell",
  EDITABLEINPUT_CELL: "editableinput_cell",
  MODIFY_STATUS_EDITABLEINPUT_CELL: "modify_status_editableinput_cell",
  RESIZE_COLUMN: "resize_column",
  SCROLL: "scroll",
  FOCUS_GRID: "focus_grid",
  BLUR_GRID: "blur_grid"
} as DrawGridEvents;

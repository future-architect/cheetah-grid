/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNode } from "./utils";

type SymbolType = (description?: string | number) => symbol;

const Symbol: SymbolType = isNode
  ? (global.Symbol as SymbolType)
  : (window.Symbol as SymbolType)
  ? (window.Symbol as SymbolType)
  : ((): SymbolType => {
      function random(): string {
        const c = "abcdefghijklmnopqrstuvwxyz0123456789";
        const cl = c.length;
        let r = "";
        for (let i = 0; i < 10; i++) {
          r += c[Math.floor(Math.random() * cl)];
        }
        return r;
      }
      return (name?: string | number): symbol => {
        if (name) {
          return `#${name}_${random()}` as any;
        } else {
          return `#_${random()}` as any;
        }
      };
    })();
const mem: { [key: string]: symbol } = {};

export function get(
  name?: string
): "$$$$private symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  if (name) {
    return (mem[name] ? mem[name] : (mem[name] = Symbol(name))) as any;
  } else {
    return Symbol() as any;
  }
}
export function getProtectedSymbol(): "$$$$protected symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("protected") as any;
}
export function getCheckColumnStateId(): "$$$$chkcol.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("chkcol.stateID") as any;
}
export function getRadioColumnStateId(): "$$$$rdcol.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("rdcol.stateID") as any;
}
export function getButtonColumnStateId(): "$$$$btncol.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("btncol.stateID") as any;
}
export function getColumnFadeinStateId(): "$$$$col.fadein_stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("col.fadein_stateID") as any;
}
export function getBranchGraphColumnStateId(): "$$$$branch_graph_col.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("branch_graph_col.stateID") as any;
}
export function getTreeColumnStateId(): "$$$$tree_col.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("tree_col.stateID") as any;
}
export function getSmallDialogInputEditorStateId(): "$$$$small_dialog_input_editor.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("small_dialog_input_editor.stateID") as any;
}
export function getInlineInputEditorStateId(): "$$$$inline_input_editor.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("inline_input_editor.stateID") as any;
}
export function getInlineMenuEditorStateId(): "$$$$inline_menu_editor.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("inline_menu_editor.stateID") as any;
}
export function getCheckHeaderStateId(): "$$$$check_header.stateID symbol$$$$" /* It is treated as a string so that it can be handled easily with typescript. */ {
  return get("check_header.stateID") as any;
}

import type { PasteRangeBoxValues } from "../ts-types";

export function normalizePasteValue(text: string): string {
  return text[text.length - 1] !== "\n"
    ? text
    : text[text.length - 2] === "\r"
    ? text.slice(0, -2)
    : text.slice(0, -1);
}
type ParsePasteRangeBoxValuesOption = { trimOnPaste: boolean };
export function parsePasteRangeBoxValues(
  value: string,
  option: ParsePasteRangeBoxValuesOption
): PasteRangeBoxValues {
  const normalizedValue = normalizePasteValue(value);
  const { values, colCount } = parseValues(normalizedValue, option);
  return {
    colCount,
    rowCount: values.length,
    getCellValue(offsetCol: number, offsetRow: number): string {
      return values[offsetRow]?.[offsetCol] ?? "";
    },
  };
}

function parseValues(
  text: string,
  { trimOnPaste }: ParsePasteRangeBoxValuesOption
) {
  const len = text.length;
  const adjustCell: (cell: string) => string = trimOnPaste
    ? (cell) => cell.trim()
    : (cell) => cell;
  let colCount = 1;
  let line: string[] = [];
  const values: string[][] = [line];
  let cell = "";
  for (let index = 0; index < len; index++) {
    const char = text[index];
    if (char === "\t") {
      line.push(adjustCell(cell));
      cell = "";
      continue;
    }
    if (char === "\n") {
      // End of line
      cell = adjustCell(cell);
      if (cell[cell.length - 1] === "\r") {
        cell = cell.slice(0, -1);
      }
      line.push(cell);
      colCount = Math.max(colCount, line.length);
      line = [];
      values.push(line);
      cell = "";
      continue;
    }
    if (char === '"' && !cell.trim()) {
      const quoted = processQuotedCell(index + 1);
      if (quoted) {
        ({ cell } = quoted);
        index = quoted.next - 1;
        continue;
      }
    }

    cell += char;
  }

  // End of text
  line.push(adjustCell(cell));
  colCount = Math.max(colCount, line.length);
  return { values, colCount };

  function processQuotedCell(start: number) {
    let cell = "";
    let index = start;
    while (index < len) {
      const char = text[index];
      if (char !== '"') {
        cell += char;
        index++;
        continue;
      }
      if (text[index + 1] === '"') {
        // Escape
        cell += '"';
        index += 2;
        continue;
      }
      // Maybe end quote
      let next = index + 1;
      while (next < len) {
        const c = text[next];
        if (c.trim()) {
          // Not quoted. e.g. "A"B
          return null;
        }
        if (c === "\t" || c === "\n") {
          break;
        }
        // Allow spaces
        next++;
      }
      // End quote
      return { cell, next };
    }
    return null;
  }
}

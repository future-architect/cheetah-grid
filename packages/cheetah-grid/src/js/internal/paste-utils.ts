import type { PasteRangeBoxValues } from "../ts-types";

export function parsePasteRangeBoxValues(
  value: string,
  { trimOnPaste }: { trimOnPaste: boolean }
): PasteRangeBoxValues {
  const normalizeValue = value.replace(/\r?\n$/, "");
  const lines = normalizeValue.split(/(?:\r?\n)|[\u2028\u2029]/g);
  const values = lines.map((line) => line.split(/\t/g));
  const colCount = values.reduce((n, cells) => Math.max(n, cells.length), 0);
  return {
    colCount,
    rowCount: values.length,
    getCellValue(offsetCol: number, offsetRow: number): string {
      const line = values[offsetRow];
      if (line) {
        const cell = line[offsetCol];
        if (cell) {
          return trimOnPaste ? cell.trim() : cell;
        }
      }
      return "";
    },
  };
}

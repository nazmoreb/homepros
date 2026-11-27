export function escapeCsvCell(value: string): string {
  let cell = value ?? "";
  if (/^[=+\-@]/.test(cell)) cell = `'${cell}`;
  if (/[",\n\r]/.test(cell)) return `"${cell.replaceAll('"', '""')}"`;
  return cell;
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\n");
}

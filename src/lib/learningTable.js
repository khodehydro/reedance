// A small, spreadsheet-like authoring format for lesson and vocabulary tables.
// First grid row = column headings; every following row = one data row. The
// dimensions are derived from the grid, so there are no counts to keep in sync.
// Existing tables with separate `columns` / `rows` still render unchanged.
export function createLearningTable({ grid, rowHeader = true, ...details }) {
  const label = details.titleEn || details.titleFa || "Learning table";
  if (
    typeof details.titleFa !== "string" ||
    !details.titleFa.trim() ||
    typeof details.titleEn !== "string" ||
    !details.titleEn.trim()
  ) {
    throw new TypeError(`${label}: provide titleFa and titleEn`);
  }
  if ("columns" in details || "rows" in details) {
    throw new TypeError(
      `${label}: use grid instead of separate columns or rows`,
    );
  }
  if (typeof rowHeader !== "boolean") {
    throw new TypeError(`${label}: rowHeader must be true or false`);
  }
  if (
    !Array.isArray(grid) ||
    grid.length < 2 ||
    !Array.isArray(grid[0]) ||
    grid[0].length < 1
  ) {
    throw new TypeError(
      `${label}: grid needs a heading row with at least one column and one data row`,
    );
  }
  const width = grid[0].length;
  grid.forEach((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== width) {
      throw new RangeError(
        `${label}: grid row ${rowIndex + 1} needs ${width} cells`,
      );
    }
    row.forEach((cell, columnIndex) => {
      const valid =
        typeof cell === "string" ||
        (cell !== null &&
          typeof cell === "object" &&
          typeof cell.fa === "string" &&
          typeof cell.en === "string");
      if (!valid) {
        throw new TypeError(
          `${label}: invalid cell at row ${rowIndex + 1}, column ${columnIndex + 1}`,
        );
      }
      if (
        rowIndex === 0 &&
        (typeof cell === "string"
          ? !cell.trim()
          : !cell.fa.trim() || !cell.en.trim())
      ) {
        throw new TypeError(`${label}: heading ${columnIndex + 1} needs text`);
      }
    });
  });
  const [columns, ...rows] = grid;
  return {
    ...details,
    columns: [...columns],
    rows: rows.map((row) => [...row]),
    rowHeader,
  };
}

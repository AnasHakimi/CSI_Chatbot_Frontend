// Works for Power BI executeQueries response
export function parsePBIResult(resultJson) {
  // Expected: { results: [{ tables: [{ name, columns:[{name,dataType}], rows:[{...}] }] }] }
  if (!resultJson?.results?.length) return { columns: [], rows: [] };

  const table = resultJson.results[0]?.tables?.[0];
  if (!table) return { columns: [], rows: [] };

  // If rows are arrays, map with columns; if objects, use directly
  const columns = (table.columns || []).map(c => c.name);
  let rows = [];

  if (Array.isArray(table.rows) && table.rows.length) {
    const first = table.rows[0];
    if (Array.isArray(first)) {
      rows = table.rows.map(arr => Object.fromEntries(arr.map((v,i)=>[columns[i] ?? `col_${i}`, v])));
    } else {
      rows = table.rows; // already objects
    }
  }
  return { columns, rows };
}

export function guessChartConfig(columns, rows) {
  if (!columns.length || !rows.length) return null;
  // pick first string-like as X, first numeric as Y
  const sample = rows[0];
  const numCols = columns.filter(c => typeof sample[c] === "number");
  const dimCols = columns.filter(c => typeof sample[c] !== "number");

  const xKey = dimCols[0] || columns[0];
  const yKey = numCols[0] || (columns.find(c => Number.isFinite(Number(sample[c]))) || columns[1]);
  if (!xKey || !yKey) return null;

  // normalize numeric
  const data = rows.map(r => ({ ...r, [yKey]: Number(r[yKey]) }));
  return { xKey, yKey, data };
}

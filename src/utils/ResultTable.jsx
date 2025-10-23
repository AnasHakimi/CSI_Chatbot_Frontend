export default function ResultTable({ columns, rows }) {
  if (!columns?.length || !rows?.length) return null;
  return (
    <div className="overflow-auto border rounded-xl mt-4">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>{columns.map(c => <th key={c} className="text-left px-3 py-2 font-semibold">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-950">
              {columns.map(c => <td key={c} className="px-3 py-2 whitespace-nowrap">{String(r[c] ?? "")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

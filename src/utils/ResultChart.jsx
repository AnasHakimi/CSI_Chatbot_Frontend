import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ResultChart({ data, xKey, yKey }) {
  if (!data?.length || !xKey || !yKey) return null;
  return (
    <div className="h-80 mt-4 border rounded-xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={yKey} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

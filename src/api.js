import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export async function askPowerBI(question) {
  const { data } = await api.post("/ask", { question });

  // Normalize backend response for React
  return {
    type: data.type || (data.chart ? "chart" : "text"),
    answer:
      data.type === "text" || (!data.type && !data.chart)
        ? data.answer || data.data || "No answer provided."
        : data.type === "table"
        ? "Here’s the table result:"
        : data.type === "chart" || data.chart
        ? "Here’s the chart result:"
        : "Response received.",
    chart: data.chart || (data.type === "chart" ? data.data : null) || null,
    table: data.table || (data.type === "table" ? data.data : null) || null,
  };
}

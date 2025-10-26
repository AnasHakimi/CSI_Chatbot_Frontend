import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export async function askPowerBI(question) {
  const { data } = await api.post("/ask", { question });

  // Normalize backend structure
  return {
    type: data.type,
    answer:
      data.type === "text"
        ? data.data
        : data.type === "table"
        ? "Here’s the table result:"
        : data.type === "chart"
        ? "Here’s the chart result:"
        : "Response received",
    chart: data.type === "chart" ? data.data : null,
    table: data.type === "table" ? data.data : null,
  };
}

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export async function askPowerBI(question) {
  const { data } = await api.post("/ask", { question });
  return data; 
  // The backend returns: { generated_code, result, summary, chart_base64 }
}

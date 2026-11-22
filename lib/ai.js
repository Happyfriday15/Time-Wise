const HELPER_URL = "http://192.168.0.94:3002/ai";

export async function askTimeWise(survey) {
  const response = await fetch(HELPER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ survey }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "I could not reach Time Wise. Check Wi-Fi and make sure the helper is running.");
  return body.answer || "I could not make a suggestion yet. You can choose a limit yourself.";
}

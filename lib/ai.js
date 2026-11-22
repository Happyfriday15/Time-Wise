export async function askTimeWise(survey) {
  const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ survey }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "I could not reach Time Wise. Please try again in a moment.");
  return body.answer || "I could not make a suggestion yet. You can choose a limit yourself.";
}

const LOCAL_AI_URL = process.env.EXPO_PUBLIC_LOCAL_AI_URL || "http://localhost:3001/api/ai";

export async function askAi(prompt) {
  const url = typeof window === "undefined" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_AI_URL
    : "/api/ai";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The AI service is unavailable.");
  return body.answer;
}

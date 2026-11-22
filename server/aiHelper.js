const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { runWithKey, KeygenError } = require("./getKey");
const PORT = Number(process.env.PORT || 3002);
const ROOT = path.resolve(__dirname, "..");

function aiInstructions() {
  const brief = fs.readFileSync(path.join(ROOT, "BRIEF.md"), "utf8");
  const start = brief.indexOf("## My AI’s instructions");
  const end = brief.indexOf("\n## ", start + 5);
  return brief.slice(start, end === -1 ? brief.length : end);
}

async function answer(survey) {
  return runWithKey(async (apiKey) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-5.6-luna", messages: [{ role: "system", content: aiInstructions() }, { role: "user", content: `The user completed this checklist: ${JSON.stringify(survey)}. Suggest a short screen-time limit and 1 or 2 options. Ask for consent; do not change anything yourself.` }], max_completion_tokens: 180 }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(body?.error?.message || "OpenAI could not answer."); error.status = response.status; throw error; }
    return body.choices?.[0]?.message?.content?.trim() || "I could not make a suggestion yet.";
  });
}

function send(response, status, body) { response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); response.end(JSON.stringify(body)); }
const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method !== "POST" || request.url !== "/ai") return send(response, 404, { error: "That helper address is not available." });
  let raw = ""; request.on("data", (chunk) => { raw += chunk; }); request.on("end", async () => {
    try { const body = JSON.parse(raw || "{}"); if (!body.survey) return send(response, 400, { error: "Please complete the checklist first." }); send(response, 200, { answer: await answer(body.survey) }); }
    catch (error) { if (error instanceof KeygenError) return send(response, 502, { error: error.message }); send(response, 502, { error: "I could not reach the AI. Check Wi-Fi and make sure the helper is running." }); }
  });
});
server.listen(PORT, "0.0.0.0", () => console.log(`Time Wise AI helper listening on port ${PORT}`));

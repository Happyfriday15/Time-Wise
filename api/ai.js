"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { runWithKey } = require("../server/getKey");

function readAiInstructions() {
  const brief = fs.readFileSync(path.join(process.cwd(), "BRIEF.md"), "utf8");
  const heading = "## My AI’s instructions";
  const start = brief.indexOf(heading);
  if (start < 0) throw new Error("The AI instructions section is missing from BRIEF.md.");
  const nextHeading = brief.indexOf("\n## ", start + heading.length);
  return brief.slice(start, nextHeading < 0 ? undefined : nextHeading).trim();
}

function send(response, status, body) {
  return response.status(status).setHeader("Content-Type", "application/json").send(body);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Only POST is supported." });
  }

  const survey = request.body?.survey;
  if (!survey || typeof survey !== "object" || Array.isArray(survey)) {
    return send(response, 400, { error: "Please complete the checklist first." });
  }

  try {
    const systemInstructions = readAiInstructions();
    const answer = await runWithKey(async (apiKey) => {
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-5.6-luna",
          messages: [
            { role: "system", content: systemInstructions },
            { role: "user", content: `The user completed this screen-time checklist: ${JSON.stringify(survey)}. Briefly suggest a sensible limit and one or two alternatives. The user decides; ask for consent and do not change or save anything.` },
          ],
          max_completion_tokens: 220,
        }),
      });
      const body = await result.json().catch(() => ({}));
      if (!result.ok) {
        const error = new Error(body?.error?.message || `AI service failed with HTTP ${result.status}.`);
        error.status = result.status;
        throw error;
      }
      return body?.choices?.[0]?.message?.content?.trim() || "I couldn't make a suggestion just yet. You can choose a limit yourself.";
    });
    return send(response, 200, { answer });
  } catch (error) {
    console.error(error);
    return send(response, error.name === "KeygenError" ? 503 : 502, {
      error: error.message || "The AI service is unavailable. Please try again in a moment.",
    });
  }
};

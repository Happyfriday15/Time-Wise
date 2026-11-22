"use strict";

const { runWithKey } = require("../server/getKey");

function send(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json").send(body);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Only POST is supported." });
  }

  const prompt = typeof request.body?.prompt === "string" ? request.body.prompt.trim() : "";
  if (!prompt || prompt.length > 4000) {
    return send(response, 400, { error: "Please provide a prompt of 1–4000 characters." });
  }

  try {
    const answer = await runWithKey(async (apiKey) => {
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-5.6-luna",
          messages: [
            { role: "system", content: "You are Time Wise, a concise and encouraging time-planning coach. Give practical, short advice." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const body = await result.json().catch(() => ({}));
      if (!result.ok) {
        const error = new Error(body?.error?.message || `AI service failed with HTTP ${result.status}.`);
        error.status = result.status;
        throw error;
      }
      return body?.choices?.[0]?.message?.content?.trim() || "I couldn't make a plan just yet.";
    });

    return send(response, 200, { answer });
  } catch (error) {
    console.error(error);
    return send(response, error.name === "KeygenError" ? 503 : 502, {
      error: error.message || "The AI service is unavailable.",
    });
  }
};

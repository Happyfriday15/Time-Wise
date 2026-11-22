"use strict";

// Server-only module. Never import this file into browser/page code.

const fs = require("node:fs");
const path = require("node:path");

function loadLocalEnv() {
  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^(KEYGEN_URL|KEYGEN_TOKEN)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadLocalEnv();

let cached = null;

class KeygenError extends Error {
  constructor(message, fix) {
    super(message);
    this.name = "KeygenError";
    this.fix = fix || "Check the Keygen service configuration and try again.";
  }
}

function getConfig() {
  const url = process.env.KEYGEN_URL;
  const token = process.env.KEYGEN_TOKEN;

  if (!url || !token || url === "paste-here" || token === "paste-here") {
    throw new KeygenError(
      "The AI key service is not configured yet.",
      "Put the real KEYGEN_URL and KEYGEN_TOKEN values in the server's .env file."
    );
  }

  return { url: url.replace(/\/$/, ""), token };
}

function isUsableCache(entry) {
  return entry && entry.apiKey && Number.isFinite(entry.expiresAt) && Date.now() < entry.expiresAt;
}

async function lookupKey() {
  const { url, token } = getConfig();
  const response = await fetch(`${url}/api/lookup-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || body?.error) {
    const message = body?.error?.message || `Key service failed with HTTP ${response.status}.`;
    const fix = body?.error?.fix || "Check the Keygen service and server configuration.";
    console.error(fix);
    throw new KeygenError(message, fix);
  }

  const expiresAt = Date.parse(body?.expiresAt);
  if (!body?.apiKey || !Number.isFinite(expiresAt)) {
    const fix = "Make sure the key service returns apiKey and a valid expiresAt date.";
    console.error(fix);
    throw new KeygenError("The key service returned an invalid response.", fix);
  }

  cached = { apiKey: body.apiKey, expiresAt };
  return cached.apiKey;
}

/**
 * Gets a cached AI key, or asks the key service for a new one after expiry.
 * Pass forceRefresh: true after OpenAI rejects the current key.
 */
async function getKey({ forceRefresh = false } = {}) {
  if (!forceRefresh && isUsableCache(cached)) {
    return cached.apiKey;
  }
  return lookupKey();
}

function isRejectedKeyError(error) {
  return error?.status === 401 || error?.status === 403 || /invalid.*api.?key|incorrect.*api.?key/i.test(error?.message || "");
}

/**
 * Runs one server-side OpenAI request and refreshes the key at most once if OpenAI rejects it.
 * callOpenAI receives the key and must return the AI response.
 */
async function runWithKey(callOpenAI) {
  let key = await getKey();
  try {
    return await callOpenAI(key);
  } catch (error) {
    if (!isRejectedKeyError(error)) throw error;
    key = await getKey({ forceRefresh: true });
    return callOpenAI(key);
  }
}

module.exports = { getKey, runWithKey, KeygenError };

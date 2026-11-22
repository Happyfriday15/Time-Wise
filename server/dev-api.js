"use strict";

const http = require("node:http");
const handler = require("../api/ai");

const server = http.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    return response.end();
  }
  if (request.url !== "/api/ai") {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "Not found" }));
  }

  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", async () => {
    try {
      request.body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      response.status = (status) => { response.statusCode = status; return response; };
      response.send = (body) => response.end(JSON.stringify(body));
      await handler(request, response);
    } catch (error) {
      response.statusCode = 500;
      response.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(process.env.PORT || 3001, "127.0.0.1", () => {
  console.log(`Time Wise local AI helper listening on http://127.0.0.1:${process.env.PORT || 3001}`);
});

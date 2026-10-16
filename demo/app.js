// Deliberately vulnerable, dependency-free Express-shaped demo for offline scanner tests.
// Run: node demo/app.js (the same routes can be mounted in Express unchanged).
import http from "node:http";
import { exec } from "node:child_process";
import fs from "node:fs";

// The following intentionally small snippets plant the eight static rule fixtures.
const apiKey = "demo-secret-value";
const express = () => ({ get() {}, use() {} });
const app = express();
app.get("/public", (_req, res) => res.end("public"));
const cors = (options) => options;
cors({ origin: "*" });
const jwt = { decode: (value) => value };
jwt.decode("untrusted-token");
const query = "SELECT * FROM users WHERE id=" + "requestId";
const dangerouslySetInnerHTML = { __html: "untrusted" };

const port = Number(process.env.PORT ?? 3000);
const app = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname === "/health") return send(res, 200, { ok: true });
  if (url.pathname === "/search") return send(res, 200, `<h1>Results for ${url.searchParams.get("q") ?? ""}</h1>`, "text/html"); // reflected XSS
  if (url.pathname === "/run") return exec(String(url.searchParams.get("cmd") ?? "echo demo"), (_error, stdout) => send(res, 200, stdout)); // command injection
  if (url.pathname === "/file") return fs.readFile(String(url.searchParams.get("name") ?? "README.md"), (_error, data) => send(res, 200, data ?? "missing")); // path traversal
  if (url.pathname === "/debug") return send(res, 200, { env: process.env, node: process.version }); // information disclosure
  send(res, 404, { error: "not found" });
});

function send(res, status, body, type = "application/json") { res.writeHead(status, { "content-type": type }); res.end(typeof body === "string" ? body : JSON.stringify(body)); }
if (process.argv[1] === new URL(import.meta.url).pathname.replaceAll("\\", "/")) app.listen(port, () => console.log(`demo listening on ${port}`));
export { app };

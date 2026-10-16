// Deliberately vulnerable, dependency-free Express-shaped demo for offline scanner tests.
// Run: node demo/app.js (the same routes can be mounted in Express unchanged).
import http from "node:http";
import { exec } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

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
const reqFixture = { query: { cmd: "demo" } };
exec(reqFixture.query.cmd);

const port = Number(process.env.PORT ?? 3000);
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname === "/") return send(res, 200, '<script src="/app.js"></script>firebaseConfig={apiKey:"AIzaSyDemoKey12345"}', "text/html", { "access-control-allow-origin": "*", "set-cookie": "sid=demo" });
  if (url.pathname === "/.env") return send(res, 200, "API_KEY=demo-secret-value", "text/plain");
  if (url.pathname === "/app.js") return send(res, 200, 'const apiKey="demo-frontend-secret"', "application/javascript");
  if (url.pathname === "/api/public") return send(res, 200, { ok: true });
  if (url.pathname === "/health") return send(res, 200, { ok: true });
  if (url.pathname === "/search") return send(res, 200, `<h1>Results for ${url.searchParams.get("q") ?? ""}</h1>`, "text/html"); // reflected XSS
  if (url.pathname === "/run") return exec(String(url.searchParams.get("cmd") ?? "echo demo"), (_error, stdout) => send(res, 200, stdout)); // command injection
  if (url.pathname === "/file") return fs.readFile(String(url.searchParams.get("name") ?? "README.md"), (_error, data) => send(res, 200, data ?? "missing")); // path traversal
  if (url.pathname === "/debug") return send(res, 200, { env: process.env, node: process.version }); // information disclosure
  send(res, 404, { error: "not found" });
});

function send(res, status, body, type = "application/json", headers = {}) { res.writeHead(status, { "content-type": type, ...headers }); res.end(typeof body === "string" ? body : JSON.stringify(body)); }
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) server.listen(port, () => console.log(`demo listening on ${port}`));
export { app };

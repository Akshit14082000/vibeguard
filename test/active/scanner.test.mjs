import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { scanActive } from "../../dist/active/scanner.js";

test("active scanner reports safe checks against a local deterministic server", async () => {
  const server = createServer((req, res) => {
    if (req.url === "/.env") { res.writeHead(200, { "content-type": "text/plain" }); res.end("API_KEY=fixture-secret"); return; }
    if (req.url === "/") { res.writeHead(200, { "access-control-allow-origin": "*", "set-cookie": "sid=fixture" }); res.end('<script src="/app.js"></script> firebaseConfig={apiKey:"AIzaSyFixtureKey12345"}'); return; }
    if (req.url === "/app.js") { res.end('const apiKey="fixture-secret-value"'); return; }
    if (req.url?.startsWith("/api")) { res.end('{"ok":true}'); return; }
    res.writeHead(404); res.end("no");
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    const result = await scanActive(`http://127.0.0.1:${address.port}/`, { iOwnThis: true, timeoutMs: 1000 });
    assert.ok(result.findings.some(f => f.check === "exposed-sensitive-files"));
    assert.ok(result.findings.some(f => f.check === "frontend-secrets"));
    assert.ok(result.findings.some(f => f.check === "permissive-cors"));
    assert.ok(result.findings.some(f => f.check === "insecure-cookies"));
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test("active scanner rejects non-local targets", async () => {
  const { scanActive } = await import("../../dist/active/scanner.js");
  await assert.rejects(() => scanActive("https://example.com", { iOwnThis: true }), /local targets/);
});

test("active scanner requires explicit ownership acknowledgement", async () => {
  const { scanActive } = await import("../../dist/active/scanner.js");
  await assert.rejects(() => scanActive("http://127.0.0.1:1"), /--i-own-this/);
});

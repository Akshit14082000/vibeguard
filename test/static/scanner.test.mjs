import test from "node:test";
import assert from "node:assert/strict";
import { rules, scanSources } from "../../dist/static/index.js";

test("exposes exactly eight documented static rules", () => {
  assert.equal(rules.length, 8);
  assert.deepEqual(rules.map((rule) => rule.id), [
    "hardcoded-secrets", "unauthenticated-express-route", "sql-string-concatenation",
    "dangerously-set-inner-html", "weak-jwt", "missing-helmet", "permissive-cors", "command-injection",
  ]);
});

test("finds all eight rules and reports stable file/line evidence", () => {
  const findings = scanSources({
    "src/app.ts": [
      "const apiKey = '123456789abcdef';",
      "const app = express();",
      "app.get('/public', (req, res) => res.send('ok'));",
      "db.query('SELECT * FROM users WHERE id=' + req.query.id);",
      "return <div dangerouslySetInnerHTML={{__html: value}} />;",
      "jwt.decode(token);",
      "app.use(cors({ origin: '*' }));",
      "exec('ls ' + req.query.path);",
    ].join("\n"),
    "notes.txt": "password = 'not-a-source-finding'",
  });
  assert.deepEqual(new Set(findings.map((finding) => finding.ruleId)), new Set(rules.map((rule) => rule.id)));
  assert.equal(findings.every((finding) => finding.file === "src/app.ts"), true);
  assert.equal(findings.find((finding) => finding.ruleId === "hardcoded-secrets").line, 1);
});

test("supports selecting rules and ignores non-source files", () => {
  const findings = scanSources({
    "server.ts": "const key = '123456789';",
    "fixture.json": "{\"apiKey\":\"123456789\"}",
  }, { rules: ["hardcoded-secrets"] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, "hardcoded-secrets");
});

test("does not report helmet when it is installed", () => {
  const findings = scanSources({ "app.js": "const app = express(); app.use(helmet());" });
  assert.equal(findings.some((finding) => finding.ruleId === "missing-helmet"), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { correlateFindings, createReport, toHtml, toJson } from "../../dist/report/index.js";

const stat = { id: "s1", ruleId: "no-command-exec", title: "Command execution", severity: "critical", source: "static", endpoint: "/run" };

test("only matching live evidence confirms a static finding", () => {
  const result = correlateFindings([stat], [{ id: "a1", ruleId: "no-command-exec", title: "live", severity: "critical", source: "active", endpoint: "/run", evidence: [{ kind: "status", value: "200" }] }]);
  assert.equal(result[0].confirmed, true);
  assert.equal(result[0].source, "correlated");
  assert.equal(correlateFindings([stat], [{ ...result[0], ruleId: "different", source: "active" }])[0].confirmed, false);
});

test("reports are deterministic and escape HTML", () => {
  const report = createReport({ target: "http://demo", generatedAt: "2026-01-01T00:00:00.000Z", findings: [{ ...stat, title: "<script>alert(1)</script>", confirmed: true }] });
  assert.equal(report.summary.total, 1);
  assert.equal(report.summary.confirmed, 0); // static findings are never confirmed by themselves
  assert.match(toJson(report), /"schemaVersion": "1"/);
  assert.match(toHtml(report), /&lt;script&gt;/);
  assert.doesNotMatch(toHtml(report), /<script>alert/);
});

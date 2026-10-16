import { findingsForMatches, lineMatches, rule } from "./helpers.js";
import type { StaticRule } from "./types.js";

// Deliberately line-oriented: this is predictable, dependency-free triage rather than a replacement for a parser.
export const rules: StaticRule[] = [
  rule("hardcoded-secrets", "Hardcoded secret", "high", "Detects secret-looking assignments and credentials in source.", /\b(?:api[_-]?key|\bkey|secret|password|passwd|token|private[_-]?key)\s*[:=]\s*["'`][^"'`\n]{8,}["'`]/i, "A credential-like value is embedded in source; load it from a secret manager or environment instead."),
  { id: "unauthenticated-express-route", title: "Unauthenticated Express route", severity: "high", description: "Detects Express route handlers without a recognizable authentication middleware.", scan: (file, source) => findingsForMatches({ id: "unauthenticated-express-route", title: "Unauthenticated Express route", severity: "high" }, file, source, lineMatches(source, /\b(?:app|router)\.(?:get|post|put|patch|delete|all|options|head)\s*\((?![^\n]*(?:auth|authenticate|requireLogin|protect|passport|jwt))/i, "An Express route appears to have no auth middleware; require authentication before the handler.")) },
  rule("sql-string-concatenation", "SQL string concatenation", "high", "Detects SQL statements assembled with string concatenation or interpolation.", /(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)[\s\S]{0,120}(?:\+\s*\w+|`[^`]*\$\{)/i, "Build SQL with parameterized queries rather than interpolating or concatenating input."),
  rule("dangerously-set-inner-html", "dangerouslySetInnerHTML", "high", "Detects React's raw HTML escape hatch in JS/TS source.", /dangerouslySetInnerHTML\s*(?::|=)/i, "Raw HTML bypasses normal escaping; sanitize trusted content before rendering."),
  rule("weak-jwt", "Weak JWT usage", "high", "Detects JWT verification with weak algorithms or missing verification options.", /jwt\.(?:decode\s*\(|verify\s*\([^\n]*(?:algorithm[s]?\s*:\s*\[?\s*["'](?:none|HS256)["'])?)/i, "JWT validation is weak or absent; verify signatures with an allowlisted strong algorithm."),
  { id: "missing-helmet", title: "Missing Express security headers", severity: "medium", description: "Detects Express app setup without helmet middleware.", scan: (file, source) => {
    if (!/\b(?:const|let|var)\s+app\s*=\s*express\s*\(/i.test(source) || /\b(?:helmet|app\.use\s*\(\s*helmet)/i.test(source)) return [];
    const match = lineMatches(source, /\b(?:const|let|var)\s+app\s*=\s*express\s*\(/i, "Express app does not appear to install helmet security headers.");
    return findingsForMatches({ id: "missing-helmet", title: "Missing Express security headers", severity: "medium" }, file, source, match);
  } },
  rule("permissive-cors", "Permissive CORS", "medium", "Detects wildcard CORS origins in Express applications.", /\bcors\s*\(\s*\{[^\n]*\borigin\s*:\s*["']\*["']/i, "Avoid allowing every origin; use an explicit allowlist for cross-origin requests."),
  rule("command-injection", "Command injection risk", "critical", "Detects shell execution assembled from request data or string concatenation.", /\b(?:exec|execSync|spawn|spawnSync)\s*\([^\n]*(?:\+\s*\w+|`[^`]*\$\{|req\.(?:body|query|params))/i, "Do not pass untrusted request data to shell execution; use fixed arguments and validation."),
];

export const rulesById = new Map(rules.map((item) => [item.id, item]));

import type { ScanReport } from "./types.js";

const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));

export function toHtml(report: ScanReport): string {
  const rows = report.findings.map((finding) => `<tr><td>${escape(finding.severity)}</td><td>${escape(finding.ruleId)}</td><td>${escape(finding.title)}</td><td>${finding.confirmed ? "confirmed" : "unconfirmed"}</td><td>${escape(finding.file ?? finding.endpoint ?? "")}</td></tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>VibeGuard report</title><style>body{font:15px system-ui;margin:2rem;color:#17202a}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd;padding:.5rem;text-align:left}th{background:#edf2f7}.confirmed{color:#087f5b}</style></head><body><h1>VibeGuard report</h1><p>Target: <code>${escape(report.target)}</code> · ${report.summary.total} findings · <span class="confirmed">${report.summary.confirmed} confirmed</span></p><table><thead><tr><th>Severity</th><th>Rule</th><th>Finding</th><th>Status</th><th>Location</th></tr></thead><tbody>${rows}</tbody></table></body></html>\n`;
}

export const renderHtml = toHtml;

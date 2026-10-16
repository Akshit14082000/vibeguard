import type { ActiveFindingLike, Finding, ScanReport, Severity, StaticFindingLike } from "./types.js";
import { correlateScannerFindings } from "./correlate.js";

const severities: Severity[] = ["critical", "high", "medium", "low", "info"];

export function createReport(input: { target: string; findings: Finding[]; generatedAt?: string }): ScanReport {
  const findings = input.findings.map((finding) => ({ ...finding, confirmed: finding.source === "correlated" && finding.confirmed === true }));
  const bySeverity = Object.fromEntries(severities.map((severity) => [severity, 0])) as Record<Severity, number>;
  for (const finding of findings) bySeverity[finding.severity] += 1;
  return {
    schemaVersion: "1",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    target: input.target,
    findings,
    summary: { total: findings.length, confirmed: findings.filter((finding) => finding.confirmed).length, bySeverity },
  };
}

export function createScannerReport(input: { target: string; staticFindings: StaticFindingLike[]; activeFindings?: ActiveFindingLike[]; generatedAt?: string }): ScanReport {
  const activeFindings = input.activeFindings ?? [];
  const correlated = correlateScannerFindings(input.staticFindings, activeFindings);
  const staticRuleIds = new Set(input.staticFindings.map((finding) => finding.ruleId));
  const liveOnly: Finding[] = activeFindings.filter((finding) => !staticRuleIds.has(finding.check)).map((finding, index) => ({ id: `active-${index + 1}`, ruleId: finding.check, title: finding.title, severity: finding.severity, url: finding.url, source: "active", confirmed: false, evidence: [{ kind: "response", value: finding.evidence }] }));
  return createReport({ target: input.target, generatedAt: input.generatedAt, findings: [...correlated, ...liveOnly] });
}

export const generateReport = createReport;

export function toJson(report: ScanReport): string {
  return JSON.stringify(report, null, 2) + "\n";
}

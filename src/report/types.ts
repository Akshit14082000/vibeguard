/** Shared, serialisable finding contracts used by static and active scanners. */
export type FindingSource = "static" | "active" | "correlated";
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface FindingEvidence {
  kind: string;
  value: string;
  [key: string]: unknown;
}

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  description?: string;
  file?: string;
  line?: number;
  column?: number;
  url?: string;
  method?: string;
  endpoint?: string;
  source: FindingSource;
  confirmed?: boolean;
  evidence?: FindingEvidence[];
  remediation?: string;
  [key: string]: unknown;
}

/** Scanner-native shapes are intentionally accepted so report code stays decoupled. */
export interface StaticFindingLike { ruleId: string; title: string; severity: Severity; file: string; line: number; message: string; evidence: string }
export interface ActiveFindingLike { check: string; title: string; severity: Severity; url: string; evidence: string }

export interface ScanReport {
  schemaVersion: "1";
  generatedAt: string;
  target: string;
  findings: Finding[];
  summary: { total: number; confirmed: number; bySeverity: Record<Severity, number> };
}

export type StaticSeverity = "low" | "medium" | "high" | "critical";

export interface StaticFinding {
  ruleId: string;
  title: string;
  severity: StaticSeverity;
  file: string;
  line: number;
  message: string;
  evidence: string;
}

export interface StaticRule {
  id: string;
  title: string;
  severity: StaticSeverity;
  description: string;
  scan(file: string, source: string): StaticFinding[];
}

export interface StaticScanOptions {
  extensions?: string[];
  rules?: string[];
}

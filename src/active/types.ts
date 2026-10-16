export type ActiveCheckId =
  | "exposed-sensitive-files"
  | "frontend-secrets"
  | "unauthenticated-api"
  | "open-cloud-config"
  | "permissive-cors"
  | "insecure-cookies";

export interface ActiveFinding {
  check: ActiveCheckId;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  url: string;
  evidence: string;
}

export interface ActiveScanOptions {
  /** Explicit acknowledgement required at the scanner boundary as well as the CLI. */
  iOwnThis?: boolean;
  timeoutMs?: number;
  /** Test-only and local development override. Production scans stay loopback-only. */
  allowNonLoopback?: boolean;
}

export interface ActiveScanResult {
  target: string;
  findings: ActiveFinding[];
  checks: ActiveCheckId[];
  durationMs: number;
}

export type FetchText = (url: URL, init?: RequestInit) => Promise<Response>;

import { localTarget, makeFetcher } from "./http.js";
import { exposedSensitiveFiles, frontendSecrets, unauthenticatedApi, openCloudConfig, permissiveCors, insecureCookies } from "./checks.js";
import type { ActiveScanOptions, ActiveScanResult, FetchText } from "./types.js";

export const CHECKS = ["exposed-sensitive-files", "frontend-secrets", "unauthenticated-api", "open-cloud-config", "permissive-cors", "insecure-cookies"] as const;

export async function scanActive(target: string, options: ActiveScanOptions = {}, fetcher?: FetchText): Promise<ActiveScanResult> {
  if (options.iOwnThis !== true) throw new Error("Active scans require --i-own-this ownership authorization");
  const base = localTarget(target);
  const f = fetcher ?? makeFetcher(options.timeoutMs);
  const start = Date.now();
  const results = await Promise.all([exposedSensitiveFiles(base, f), frontendSecrets(base, f), unauthenticatedApi(base, f), openCloudConfig(base, f), permissiveCors(base, f), insecureCookies(base, f)]);
  return { target: base.toString(), checks: [...CHECKS], findings: results.flat(), durationMs: Date.now() - start };
}

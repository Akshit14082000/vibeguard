import type { ActiveFindingLike, Finding, StaticFindingLike } from "./types.js";

/** Correlate live evidence with static findings without guessing based on severity/title. */
export function correlateFindings(staticFindings: Finding[], activeFindings: Finding[]): Finding[] {
  const live = activeFindings.filter((finding) => finding.source === "active");
  return staticFindings.map((finding) => {
    const matches = live.filter((candidate) => matchesStatic(finding, candidate));
    if (matches.length === 0) return { ...finding, confirmed: false };
    const evidence = matches.flatMap((match) => match.evidence ?? []);
    return {
      ...finding,
      source: "correlated",
      confirmed: true,
      evidence: [...(finding.evidence ?? []), ...evidence],
    };
  });
}

export function correlateScannerFindings(staticFindings: StaticFindingLike[], activeFindings: ActiveFindingLike[]): Finding[] {
  const statics: Finding[] = staticFindings.map((finding, index) => ({ id: `static-${index + 1}`, ruleId: finding.ruleId, title: finding.title, severity: finding.severity, description: finding.message, file: finding.file, line: finding.line, source: "static", evidence: [{ kind: "source", value: finding.evidence }] }));
  const active: Finding[] = activeFindings.map((finding, index) => ({ id: `active-${index + 1}`, ruleId: finding.check, title: finding.title, severity: finding.severity, url: finding.url, source: "active", evidence: [{ kind: "response", value: finding.evidence }] }));
  return correlateFindings(statics, active);
}

export const correlate = correlateFindings;

function matchesStatic(staticFinding: Finding, activeFinding: Finding): boolean {
  if (staticFinding.ruleId !== activeFinding.ruleId) return false;
  const staticEndpoint = staticFinding.endpoint ?? staticFinding.url;
  const activeEndpoint = activeFinding.endpoint ?? activeFinding.url;
  if (staticEndpoint && activeEndpoint && !sameEndpoint(staticEndpoint, activeEndpoint)) return false;
  if (staticFinding.method && activeFinding.method && staticFinding.method.toUpperCase() !== activeFinding.method.toUpperCase()) return false;
  return true;
}

function sameEndpoint(left: string, right: string): boolean {
  try {
    const a = new URL(left, "http://vibeguard.local").pathname;
    const b = new URL(right, "http://vibeguard.local").pathname;
    return a.replace(/\/$/, "") === b.replace(/\/$/, "");
  } catch {
    return left === right;
  }
}

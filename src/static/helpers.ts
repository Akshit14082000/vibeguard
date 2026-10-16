import type { StaticFinding, StaticRule } from "./types.js";

export function findingsForMatches(
  rule: Pick<StaticRule, "id" | "title" | "severity">,
  file: string,
  source: string,
  matches: Array<{ line: number; evidence: string; message: string }>,
): StaticFinding[] {
  return matches.map((match) => ({ ruleId: rule.id, title: rule.title, severity: rule.severity, file, ...match }));
}

export function lineMatches(source: string, expression: RegExp, message: string) {
  const output: Array<{ line: number; evidence: string; message: string }> = [];
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    expression.lastIndex = 0;
    if (expression.test(line)) output.push({ line: index + 1, evidence: line.trim().slice(0, 300), message });
  }
  return output;
}

export function rule(id: string, title: string, severity: StaticRule["severity"], description: string, expression: RegExp, message: string): StaticRule {
  return { id, title, severity, description, scan: (file, source) => findingsForMatches({ id, title, severity }, file, source, lineMatches(source, expression, message)) };
}

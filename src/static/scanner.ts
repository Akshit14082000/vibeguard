import { readFile } from "node:fs/promises";
import { rules, rulesById } from "./rules.js";
import type { StaticFinding, StaticScanOptions } from "./types.js";

const DEFAULT_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

export function isJavaScriptOrTypeScript(file: string, extensions = DEFAULT_EXTENSIONS): boolean {
  return extensions.some((extension) => file.toLowerCase().endsWith(extension.toLowerCase()));
}

export function scanSources(sources: Record<string, string>, options: StaticScanOptions = {}): StaticFinding[] {
  const selected = options.rules?.map((id) => rulesById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? rules;
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  return Object.entries(sources).flatMap(([file, source]) => {
    if (!isJavaScriptOrTypeScript(file, extensions)) return [];
    return selected.flatMap((scanner) => scanner.scan(file, source));
  });
}

export async function scanFiles(files: string[], options: StaticScanOptions = {}): Promise<StaticFinding[]> {
  const sources: Record<string, string> = {};
  for (const file of files) if (isJavaScriptOrTypeScript(file, options.extensions ?? DEFAULT_EXTENSIONS)) sources[file] = await readFile(file, "utf8");
  return scanSources(sources, options);
}

export { rules };
export type { StaticFinding, StaticRule, StaticScanOptions } from "./types.js";

#!/usr/bin/env node
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { scanActive } from "./active/scanner.js";
import { scanFiles } from "./static/scanner.js";
import { createScannerReport, toJson, toHtml } from "./report/index.js";

const args = process.argv.slice(2);

function option(name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function sourceFiles(input: string): Promise<string[]> {
  const target = resolve(input);
  if ((await stat(target)).isFile()) return [target];
  const entries = await readdir(target, { withFileTypes: true });
  return (await Promise.all(entries.filter((entry) => !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist")
    .map((entry) => sourceFiles(join(target, entry.name))))).flat();
}

async function writeReport(report: ReturnType<typeof createScannerReport>): Promise<void> {
  const jsonPath = option("--json");
  const htmlPath = option("--html");
  for (const output of [jsonPath, htmlPath].filter((value): value is string => Boolean(value))) {
    await mkdir(resolve(output, ".."), { recursive: true });
  }
  if (jsonPath) await writeFile(resolve(jsonPath), toJson(report), "utf8");
  if (htmlPath) await writeFile(resolve(htmlPath), toHtml(report), "utf8");
  if (!jsonPath && !htmlPath) process.stdout.write(toJson(report));
}

async function main(): Promise<void> {
  const mode = args[0];
  if (mode === "active") {
    if (!args.includes("--i-own-this")) throw new Error("Active scans require --i-own-this ownership authorization");
    const target = args.find((value) => /^https?:\/\//.test(value));
    if (!target) throw new Error("An http(s) target is required");
    const result = await scanActive(target, { iOwnThis: true });
    await writeReport(createScannerReport({ target: result.target, staticFindings: [], activeFindings: result.findings }));
    return;
  }
  if (mode === "static") {
    const input = args[1];
    if (!input) throw new Error("Usage: vibeguard static <file-or-directory> [--json report.json] [--html report.html]");
    const findings = await scanFiles(await sourceFiles(input));
    await writeReport(createScannerReport({ target: resolve(input), staticFindings: findings }));
    return;
  }
  throw new Error("Usage: vibeguard static <path> | vibeguard active <url> --i-own-this");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});

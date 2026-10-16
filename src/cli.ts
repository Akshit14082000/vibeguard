#!/usr/bin/env node
import { scanActive } from "./active/scanner.js";

const args = process.argv.slice(2);
if (args[0] !== "active" || !args.includes("--i-own-this")) {
  console.error("Usage: vibeguard active <http://localhost:PORT> --i-own-this");
  process.exitCode = 2;
} else {
  const target = args.find(a => /^https?:\/\//.test(a));
  if (!target) { console.error("An http(s) target is required"); process.exitCode = 2; }
  else { scanActive(target, { iOwnThis: true }).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e instanceof Error ? e.message : String(e)); process.exitCode = 1; }); }
}

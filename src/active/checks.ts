import type { ActiveFinding, FetchText } from "./types.js";
import { text } from "./http.js";

const finding = (check: ActiveFinding["check"], title: string, severity: ActiveFinding["severity"], url: URL, evidence: string): ActiveFinding => ({ check, title, severity, url: url.toString(), evidence });

export async function exposedSensitiveFiles(base: URL, f: FetchText): Promise<ActiveFinding[]> {
  const paths = ["/.env", "/.env.local", "/.git/config", "/config.json", "/backup.zip"];
  const out: ActiveFinding[] = [];
  for (const path of paths) { const u = new URL(path, base); try { const { response, body } = await text(f, u); if (response.ok && body.trim() && (path.includes(".env") ? /(?:secret|password|api[_-]?key|database_url)\s*=/i.test(body) : true)) out.push(finding("exposed-sensitive-files", "Sensitive file is publicly readable", "high", u, `${response.status} ${path}`)); } catch { /* bounded individual probe */ } }
  return out;
}

export async function frontendSecrets(base: URL, f: FetchText): Promise<ActiveFinding[]> {
  const out: ActiveFinding[] = []; let html: string;
  try { html = (await text(f, base)).body; } catch { return out; }
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => new URL(m[1], base));
  for (const u of scripts) { try { const { body } = await text(f, u); if (/(?:AKIA|AIza)[A-Z0-9_-]{12,}|(?:api[_-]?key|secret|token)\s*[:=]\s*["'][^"']{12,}/i.test(body)) out.push(finding("frontend-secrets", "Secret-like value in frontend JavaScript", "high", u, "A credential-shaped value was found in a script bundle")); } catch { /* ignore unreachable bundle */ } }
  return out;
}

export async function unauthenticatedApi(base: URL, f: FetchText): Promise<ActiveFinding[]> {
  const out: ActiveFinding[] = []; for (const path of ["/api", "/api/users", "/api/admin", "/api/health"]) { const u = new URL(path, base); try { const r = await f(u); if (r.ok) out.push(finding("unauthenticated-api", "API endpoint responds without authentication", "medium", u, `${r.status} response to an unauthenticated GET`)); } catch { /* ignore */ } } return out;
}

export async function openCloudConfig(base: URL, f: FetchText): Promise<ActiveFinding[]> {
  const out: ActiveFinding[] = []; try { const { body } = await text(f, base); if (/(supabaseUrl|supabaseKey|firebaseConfig|firebaseio\.com|AIzaSy)/i.test(body)) out.push(finding("open-cloud-config", "Supabase/Firebase configuration exposed", "medium", base, "Cloud service URL or client configuration appears in the response")); } catch { /* ignore */ } return out;
}

export async function permissiveCors(base: URL, f: FetchText): Promise<ActiveFinding[]> {
  try { const { response } = await text(f, base, { Origin: "https://vibeguard.invalid" }); const allow = response.headers.get("access-control-allow-origin"); if (allow === "*" || allow === "https://vibeguard.invalid") return [finding("permissive-cors", "CORS permits an arbitrary origin", "medium", base, `Access-Control-Allow-Origin: ${allow}`)]; } catch { /* ignore */ } return [];
}

export async function insecureCookies(base: URL, f: FetchText): Promise<ActiveFinding[]> {
  try { const { response } = await text(f, base); const cookies = response.headers.getSetCookie?.() ?? (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")!] : []); return cookies.filter(c => !/;\s*secure(?:;|$)/i.test(c) || !/;\s*httponly(?:;|$)/i.test(c) || !/;\s*samesite=/i.test(c)).map(c => finding("insecure-cookies", "Cookie lacks secure attributes", "medium", base, c.split(";")[0])); } catch { return []; }
}

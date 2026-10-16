# VibeGuard

VibeGuard is a focused, non-destructive security scanner for JavaScript/TypeScript Express applications.

## Scope

- **Static mode:** eight source-code rules for JS/TS Express repositories.
- **Active mode:** six safe checks against a live URL. Active scans require explicit `--i-own-this` authorization.
- **Correlation:** live evidence can confirm a related static finding.
- **Reports:** JSON and HTML output.

The project includes a deliberately small vulnerable demo app for offline testing.

## Status

The focused scanner and report workflow is implemented. It intentionally stays dependency-light and supports only JavaScript/TypeScript source and Express conventions.

## Development

Use Node.js `22.14.0` (see `.node-version`). Install dependencies with:

```bash
npm ci
```

Run the offline checks with:

```bash
npm run test:offline
```

Scan a repository and write both report formats:

```bash
node dist/cli.js static ./demo --json reports/static.json --html reports/static.html
```

Scan an authorized live URL. The ownership flag is mandatory:

```bash
node dist/cli.js active https://your-owned-site.example --i-own-this --json reports/active.json --html reports/active.html
```

The active scanner issues bounded `GET` requests only. It checks six conditions: exposed sensitive files, secrets in frontend bundles, unauthenticated API exposure, open Supabase/Firebase configuration, permissive CORS, and insecure cookies. Static mode has eight rules documented in `src/static/README.md`.

For local testing, start the deliberately vulnerable demo with `node demo/app.js`, then scan `http://127.0.0.1:3000` using the ownership flag.

## Authorization

Only run active scans against systems you own or have explicit permission to test. The CLI will refuse active mode unless `--i-own-this` is provided. Active checks are designed to be non-destructive and limited to the supplied URL.

## Configuration

Copy `.env.example` to `.env` for local overrides. Do not put real secrets in source control.

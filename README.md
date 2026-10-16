# VibeGuard

VibeGuard is a focused, non-destructive security scanner for JavaScript/TypeScript Express applications.

## Scope

- **Static mode:** eight source-code rules for JS/TS Express repositories.
- **Active mode:** six safe checks against a live URL. Active scans require explicit `--i-own-this` authorization.
- **Correlation:** live evidence can confirm a related static finding.
- **Reports:** JSON and HTML output.

The project includes a deliberately small vulnerable demo app for offline testing.

## Status

Project setup is complete. Scanner commands, demo fixtures, reports, and tests are being implemented incrementally.

## Development

Use Node.js `22.14.0` (see `.node-version`). Install dependencies with:

```bash
npm ci
```

Run the offline checks with:

```bash
npm run test:offline
```

## Authorization

Only run active scans against systems you own or have explicit permission to test. The CLI will refuse active mode unless `--i-own-this` is provided. Active checks are designed to be non-destructive and limited to the supplied URL.

## Configuration

Copy `.env.example` to `.env` for local overrides. Do not put real secrets in source control.

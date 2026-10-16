# Static rules

The scanner is intentionally limited to JavaScript/TypeScript Express conventions and uses deterministic, line-oriented checks with no network access or runtime execution. It has exactly eight rules:

1. `hardcoded-secrets` — secret-looking literal assignments.
2. `unauthenticated-express-route` — `app`/`router` HTTP routes without recognizable auth middleware (`auth`, `passport`, `protect`, etc.).
3. `sql-string-concatenation` — SQL statements concatenated or interpolated with values.
4. `dangerously-set-inner-html` — React raw HTML rendering.
5. `weak-jwt` — JWT `decode` or weak `verify` algorithm configuration.
6. `missing-helmet` — an Express app without `helmet` middleware.
7. `permissive-cors` — CORS configured with wildcard origin.
8. `command-injection` — shell execution combined with request data or interpolation.

Use `scanSources({ "src/app.ts": source })` for in-memory content or `scanFiles([...])` for already-selected repository files. Findings include rule ID, severity, file, 1-based line, message, and bounded source evidence.

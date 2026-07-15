# CLAUDE.md — remote-work-radar

**Project context:** Pre-launch OSS job aggregator. Solo dev + Claude Code. Freelance-hiring signal for the author, real tool for locked-out remote devs. Two-week ship window.

## What this repo is

Monorepo (pnpm workspaces):
- `apps/web` — Next.js 16 App Router, dashboard + landing.
- `apps/mcp` — TypeScript MCP server (npm-publishable).
- `packages/db` — Prisma client, single source of truth for schema.
- `services/etl` — Python 3.13, pulls job feeds, normalizes, writes to Postgres.

## Rules — apply always

### Do

- **Own the data model.** Every source has quirks. Normalize aggressively in `services/etl/normalize.py`. No source-specific fields leak into the DB.
- **Beginner mode is not a feature flag — it is the default.** If a UI decision is between "clean but assumes context" and "explains itself", pick explaining.
- **Every scraper has a `raw_snapshot` column.** Store the original payload as JSONB. When normalization breaks, we can replay.
- **Dedup on `(source, external_id)` first, then `(title_normalized, company_normalized)` for cross-source.** Same job on WWR and RemoteOK is one row with two source refs.
- **Timezone is stored as UTC offset int (`timezone_min_utc_offset`, `timezone_max_utc_offset`).** No strings like "EU/EMEA" — parse them at ingest.

### Do not

- **Never store US-only postings as if they were global.** Parse "US only", "must be authorized to work in the US", "W2 required" — flag `us_only=true`. Filter defaults to hiding them.
- **Never over-normalize company table.** One row per company name, dedup by lower(name). No `company_locations`, `company_industries`, etc. until we actually need them.
- **Never generate cover letters that pretend the user has experience they do not have.** Beginner-mode templates open with "I'm early in my remote career and here's why this role fits" — honesty converts better than fake seniority.
- **Never scrape LinkedIn directly.** Use their RSS/API when available, or scrape a mirror. LinkedIn will IP-ban.
- **No feature flags in pre-launch.** Ship or do not ship. See [claude-code-playbook/examples/feature-flag-abuse.md](https://github.com/Regat1ve/claude-code-playbook/blob/master/examples/feature-flag-abuse.md).

## Prisma

- `prisma migrate dev` in dev only. `prisma migrate deploy` in every other environment. Never `db push`.
- Migrations are append-only once merged. If a schema change breaks something, add a new migration that fixes it.
- Run `prisma migrate status` before deploys.

## Python ETL

- Type-hint everything. `mypy --strict`.
- Every source lives in `services/etl/remote_work_radar_etl/sources/<name>.py` and exports a `fetch() -> list[RawJob]`.
- Retries: httpx `transport=httpx.HTTPTransport(retries=3)` + explicit backoff on 429. Never retry on 4xx that is not 429.
- No async unless proven necessary. Sync + threadpool is fine at this volume.

## Next.js

- App Router. Server Components by default. Client only when the component needs state or handlers.
- Data fetching in RSC. No `useEffect` for initial data.
- Filters live in URL search params so they are shareable and back-button-safe.
- TanStack Table for the /jobs feed. Column defs are stable, sorting/filtering server-side.

## MCP server

- Tool names are verb_noun: `search_jobs`, `score_fit`, `draft_cover_letter`, `mark_applied`, `list_saved`.
- Every tool returns JSON with a `_help` field explaining what to do with the result — MCP clients render this back to the user.
- The MCP server talks to the same Postgres as the web app. No separate API layer.

## Content rules

- Landing copy addresses the "locked out" pain directly. No corporate hedging.
- No emoji in code or UI copy unless the user explicitly asks.
- Cover letter templates use "I" and normal capitalization. No lowercase-i affectation.

## Money

- Never store or log user financial info.
- Never suggest payment methods that are unavailable in the user's country. If the user is RU, do not recommend Payoneer.

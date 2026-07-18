# @rwr/mcp — remote-work-radar MCP server

Search remote-work-radar's aggregated job feed, score fit, and draft cover letters from any MCP client (Claude Desktop, Cursor, etc.).

## Tools

| Tool | Purpose |
|---|---|
| `search_jobs` | Filter by category (ai-ml, frontend, backend, fullstack, devops, data, mobile, lead), free-text query, min hourly, entry-level, remote-anywhere. |
| `get_job` | Full detail + description + parsed attributes (timezone offsets, payment method hints, scam reasons). |
| `score_fit` | Heuristic 0–100 fit against your skills + target hourly. Deterministic, not LLM. |
| `draft_cover_letter` | Templated cover letter pre-filled with company / role / detected stack / your rate context. |
| `list_saved` | List a user's saved jobs, newest first. Same row shape as `search_jobs` plus `savedAt` and optional `note`. |
| `save_job` | Save (star) a job for a user. Idempotent — re-calling with a new note updates the note. |
| `unsave_job` | Unsave a job for a user. Idempotent — no-op if the row doesn't exist. |

## Install (local dev)

```bash
pnpm --filter @rwr/mcp build
```

## Claude Desktop config

Add to `claude_desktop_config.json`:

```jsonc
{
  "mcpServers": {
    "remote-work-radar": {
      "command": "node",
      "args": ["/absolute/path/to/remote-work-radar/apps/mcp/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@host/db?sslmode=require"
      }
    }
  }
}
```

Restart Claude Desktop. In a conversation:

> "Show me AI/ML jobs above $50/hr, entry-level friendly."
> "Score my fit for job {id} — I know python, react, postgres, target $40/hr."
> "Draft a cover letter for that job, my name is X, portfolio is Y."

## Example prompts

After the server shows up in Claude Desktop (paperclip icon → `remote-work-radar` listed), try:

> "Search remote AI/ML jobs from the last 7 days, entry-level friendly, remote-anywhere only. Give me the top 5 with hourly range and timezone."

> "Pull the full description for job `<id>` and tell me the red flags — payment method, timezone, US-only signal, anything that smells like a scam."

> "Score my fit for job `<id>`. My stack: Python, FastAPI, Postgres, some React. Target rate $35/hr. Explain what pulled the score down."

> "Draft a cover letter for job `<id>`. I'm Vitaly, portfolio at vitalyzelenov-portfolio.vercel.app, based in UTC+3, comfortable with 4-hour overlap. Keep it under 180 words, no fake experience."

> "Save job `<id>` with note 'strong fit, apply Monday'. Then list everything on my shortlist, newest first."

## Trouble

**Claude Desktop does not list `remote-work-radar` as a server.**
Almost always one of three things:

1. **The `args` path is not absolute.** MCP servers launched by Desktop have no working directory you can rely on. Use the full absolute path to `apps/mcp/dist/index.js`. On Windows, use forward slashes or escaped backslashes.
2. **Desktop was not fully restarted.** Quit from the tray/menubar, not just close the window. Reopen.
3. **`DATABASE_URL` is missing or wrong.** The server exits immediately on connect failure. Test the URL first with `psql "$DATABASE_URL" -c "select count(*) from \"Job\";"` — if that fails, Claude Desktop will fail the same way silently.

**Tools list is empty / errors on call.**
Rebuild: `pnpm --filter @rwr/mcp build`. The `args` path points at `dist/index.js`, so a stale build (or none) means no tools.

**Database is empty (`search_jobs` returns nothing).**
Run the ETL at least once from the repo root: `pnpm etl:once`.

## Publishing

Not yet on npm. When published:

```bash
npx -y @rwr/mcp
```

and the config `command`/`args` become `npx` / `["-y", "@rwr/mcp"]`.

## Design

- One MCP server = one Postgres. Users self-host by pointing `DATABASE_URL` at their own Neon/Supabase / whatever, seeded from the ETL.
- No auth — no cross-user data.
- Every tool response wraps a `_help` field the MCP client renders back to the user, per the project's rule in `../../CLAUDE.md`.

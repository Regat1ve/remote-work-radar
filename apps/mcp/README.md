# @rwr/mcp — remote-work-radar MCP server

Search remote-work-radar's aggregated job feed, score fit, and draft cover letters from any MCP client (Claude Desktop, Cursor, etc.).

## Tools

| Tool | Purpose |
|---|---|
| `search_jobs` | Filter by category (ai-ml, frontend, backend, fullstack, devops, data, mobile, lead), free-text query, min hourly, entry-level, remote-anywhere. |
| `get_job` | Full detail + description + parsed attributes (timezone offsets, payment method hints, scam reasons). |
| `score_fit` | Heuristic 0–100 fit against your skills + target hourly. Deterministic, not LLM. |
| `draft_cover_letter` | Templated cover letter pre-filled with company / role / detected stack / your rate context. |

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

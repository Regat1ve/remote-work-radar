# remote-work-radar

**The OSS job board for developers who got locked out of Upwork, Mercor, Deel, and Contra.**

If you live in Russia, Turkey, Iran, Venezuela, Belarus, or half a dozen other countries, most freelance platforms simply do not accept you anymore. Meanwhile you still need to eat, and remote work still exists — just not on those platforms.

`remote-work-radar` scrapes remote-first job boards that do not gatekeep by geography (WeWorkRemotely, RemoteOK, HN "Who's Hiring", YC Jobs, Wellfound, and more), normalizes them, and gives you:

- An **MCP server for Claude Desktop** — the flagship. `search_jobs`, `get_job`, `score_fit`, `draft_cover_letter`, `list_saved`, `save_job`, `unsave_job` run against your local copy of the aggregated feed. Talk to your job board from the chat, keep a shortlist without leaving it. See [`apps/mcp/README.md`](./apps/mcp/README.md)
- A **prep page per job** — auto-detected red flags (no rate stated, US-only, Payoneer for RU, suspected scam), templated cover letter starter pre-filled with company/role/stack, questions to ask them, fit checkpoints
- **Category tabs on `/jobs`** — 9 dev/AI role categories (AI/ML, Frontend, Backend, Fullstack, DevOps, Data, Mobile, Founding/Lead, plus a general bucket) so the feed reads by intent, not by scroll
- **US-only hidden by default, scam detector on** — every posting is scanned for "US only" / W-2 clauses and for scam signals (upfront fees, WhatsApp-only contact). Flip toggles to show anyway
- **Beginner mode** — glossary tooltips, "never worked remote before?" onboarding, cover letter templates that do not fake experience

Built by [Vitaly Zelenov](https://vitalyzelenov-portfolio.vercel.app) — a Russian dev who could not use Upwork.

## Who this is for

- **Locked-out devs** (RU / TR / IR / VE / BY / CU / etc.) who need contract work but cannot open a Mercor account
- **First-time remote workers** — the beginner mode explains what "hourly vs retainer" means, what a reasonable rate is, and how to spot fake postings
- **Claude Code users** — bring your own model, let the MCP server do the boring parts of a job hunt

## Stack

- `apps/web` — Next.js 16, Tailwind
- `apps/mcp` — MCP server (TypeScript, `@modelcontextprotocol/sdk`)
- `packages/db` — Prisma + Postgres 16
- `services/etl` — Python 3.13, feedparser, httpx, BeautifulSoup

## Quickstart

```bash
git clone https://github.com/Regat1ve/remote-work-radar
cd remote-work-radar
pnpm install

# Grab a free Postgres URL (Neon or Supabase both work) and put it in .env
cp .env.example .env

pnpm db:migrate
pnpm etl:once           # pulls the first batch
pnpm dev                # http://localhost:3000
```

## Try the MCP server locally

Once the web app is running (or as soon as `pnpm db:migrate` + `pnpm etl:once` have populated the DB), point Claude Desktop at it:

```bash
# 1. Clone (if you haven't) and install
git clone https://github.com/Regat1ve/remote-work-radar
cd remote-work-radar
pnpm install

# 2. Set DATABASE_URL in .env (Neon/Supabase/local Postgres all fine)
cp .env.example .env

# 3. Build the MCP server
pnpm --filter @rwr/mcp build

# 4. Add this to claude_desktop_config.json and restart Claude Desktop
```

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

Full tool reference, example prompts, and troubleshooting: [`apps/mcp/README.md`](./apps/mcp/README.md).

## Contributing

New job sources are the highest-value contribution. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT.

# remote-work-radar

**The OSS job board for developers who got locked out of Upwork, Mercor, Deel, and Contra.**

If you live in Russia, Turkey, Iran, Venezuela, Belarus, or half a dozen other countries, most freelance platforms simply do not accept you anymore. Meanwhile you still need to eat, and remote work still exists — just not on those platforms.

`remote-work-radar` scrapes remote-first job boards that do not gatekeep by geography (WeWorkRemotely, RemoteOK, HN "Who's Hiring", YC Jobs, Wellfound, and more), normalizes them, and gives you:

- A **filterable dashboard** — 9 role category tabs, timezone overlap, hourly range, entry-level toggle, "exclude US-only" switch
- A **prep page per job** — auto-detected red flags (no rate stated, US-only, Payoneer for RU, suspected scam), templated cover letter starter pre-filled with company/role/stack, questions to ask them, fit checkpoints
- An **MCP server** — Claude Desktop / Cursor can `search_jobs`, `get_job`, `score_fit`, `draft_cover_letter` against the same database. See [`apps/mcp/README.md`](./apps/mcp/README.md)
- **Beginner mode** — glossary tooltips, "never worked remote before?" onboarding, cover letter templates for people without a portfolio, red-flag detector for scam postings

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

## Contributing

New job sources are the highest-value contribution. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT.

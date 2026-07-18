import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="pt-6 pb-8">
        <p className="mb-4 inline-block rounded-full bg-ink-100 dark:bg-ink-700 px-3 py-1 text-xs font-medium">
          OSS · MIT · self-hostable
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl">
          Remote job board for developers Upwork, Mercor, and Deel won&apos;t accept.
        </h1>
        <p className="mt-6 text-lg text-ink-500 max-w-2xl leading-relaxed">
          Aggregates remote-first job feeds that do not gatekeep by country. Filters out US-only
          postings. Explains what &quot;retainer&quot; and &quot;async&quot; actually mean. Written
          for people who have never worked remote before — and for people who have, but got locked
          out of every freelance platform in 2022.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/jobs"
            className="rounded-md bg-accent-600 px-5 py-3 text-sm font-semibold text-white hover:bg-accent-500"
          >
            Browse jobs
          </Link>
          <Link
            href="/onboarding"
            className="rounded-md border border-ink-200 dark:border-ink-700 px-5 py-3 text-sm font-semibold hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            First time here? Start here →
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Who this is for</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-ink-200 dark:border-ink-700 p-5">
            <h3 className="font-semibold mb-2">Locked-out devs</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              Russia, Belarus, Iran, Venezuela, Cuba, Turkey — most freelance platforms will not
              open your account anymore. The remote job market did not disappear. It just moved off
              those platforms. This site tracks where.
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 dark:border-ink-700 p-5">
            <h3 className="font-semibold mb-2">First-time remote workers</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              Never applied to a remote role before? The glossary explains hourly vs retainer vs
              fixed, the templates give you a cover letter that does not fake experience, and the
              scam detector flags postings that ask for upfront money.
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 dark:border-ink-700 p-5">
            <h3 className="font-semibold mb-2">Claude Desktop users</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              The MCP server is live. Point Claude Desktop at your local Postgres and it can
              search jobs, score fit, draft cover letters, and save the ones worth following up on
              — without leaving the chat. See below.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-accent-600/40 bg-accent-600/5 p-6">
        <p className="mb-2 inline-block rounded-full bg-accent-600 text-white px-3 py-1 text-xs font-medium">
          Flagship feature
        </p>
        <h2 className="text-2xl font-semibold mb-3">
          Talk to your job feed from Claude Desktop
        </h2>
        <p className="text-ink-500 mb-5 max-w-3xl leading-relaxed">
          Every other remote job board is a website you scroll. This one ships an MCP server. Build
          it, drop a snippet into <code className="text-sm">claude_desktop_config.json</code>,
          restart Claude Desktop, and the aggregated feed is now a tool your model can call —
          search it, score fit against your skills, draft a cover letter, save the ones worth
          following up on. No login, no scraping session, no copy-paste from a browser tab.
        </p>
        <pre className="bg-ink-100 dark:bg-ink-900 rounded p-4 text-sm overflow-x-auto font-mono mb-5">
{`{
  "mcpServers": {
    "remote-work-radar": {
      "command": "node",
      "args": ["/absolute/path/to/remote-work-radar/apps/mcp/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@host/db?sslmode=require"
      }
    }
  }
}`}
        </pre>
        <div className="grid gap-4 md:grid-cols-2 mb-5">
          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-ink-500">
              Finding &amp; scoring
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <code>search_jobs</code> — filter by category, query, hourly, entry-level
              </li>
              <li>
                <code>get_job</code> — full detail + parsed attributes
              </li>
              <li>
                <code>score_fit</code> — deterministic 0–100 fit against your skills
              </li>
              <li>
                <code>draft_cover_letter</code> — pre-filled with role / stack / your rate
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-ink-500">
              Shortlist
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <code>list_saved</code> — pull your saved shortlist
              </li>
              <li>
                <code>save_job</code> — bookmark a posting (with a note)
              </li>
              <li>
                <code>unsave_job</code> — remove one
              </li>
            </ul>
          </div>
        </div>
        <p className="text-sm">
          Full docs, example prompts, and troubleshooting in{" "}
          <a
            href="https://github.com/Regat1ve/remote-work-radar/blob/master/apps/mcp/README.md"
            className="underline font-medium"
          >
            apps/mcp/README.md
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">How it works</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="rounded-full bg-accent-600 text-white h-7 w-7 flex-shrink-0 flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <div>
              <p className="font-medium">Feeds get pulled every 15 minutes.</p>
              <p className="text-sm text-ink-500 mt-1">
                WeWorkRemotely, RemoteOK, HN &quot;Who is hiring?&quot;, and more. Each posting is
                normalized into a common shape — timezone, hourly range, contract type, skills — and
                dropped into one of nine role categories (AI/ML, Frontend, Backend, Fullstack,
                DevOps, Data, Mobile, Founding/Lead) so the feed reads by intent, not by scroll.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="rounded-full bg-accent-600 text-white h-7 w-7 flex-shrink-0 flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <div>
              <p className="font-medium">US-only postings are hidden by default.</p>
              <p className="text-sm text-ink-500 mt-1">
                Every job description is scanned for &quot;US only&quot;, &quot;must be authorized to
                work in the US&quot;, W-2 clauses. You can flip a toggle to show them anyway.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="rounded-full bg-accent-600 text-white h-7 w-7 flex-shrink-0 flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <div>
              <p className="font-medium">Scam postings get flagged.</p>
              <p className="text-sm text-ink-500 mt-1">
                Anyone asking you to pay a &quot;training fee&quot; or contact them on WhatsApp gets
                a red badge. The scam detector is public — see how it works in{" "}
                <a
                  href="https://github.com/Regat1ve/remote-work-radar/blob/master/services/etl/remote_work_radar_etl/normalize.py"
                  className="underline"
                >
                  normalize.py
                </a>
                .
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="rounded-full bg-accent-600 text-white h-7 w-7 flex-shrink-0 flex items-center justify-center text-sm font-semibold">
              4
            </span>
            <div>
              <p className="font-medium">Every posting gets a prep page.</p>
              <p className="text-sm text-ink-500 mt-1">
                Click any job → red flags detected in that posting, cover letter starter pre-filled
                with company / role / detected stack, questions to ask them in the reply, fit
                checkpoints (transparent rate, timezone parse, entry-level signal). Then the apply
                button opens the source. Same data is exposed to Claude Desktop via the MCP server.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">See it in action</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <figure className="rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
            <img
              src="/screenshots/jobs-feed.jpg"
              alt="Jobs feed with category tabs and filters"
              className="w-full h-auto block"
            />
            <figcaption className="p-3 text-sm text-ink-500 leading-relaxed">
              /jobs — 9 category tabs, US-only hidden by default, hourly filter, timezone parse.
            </figcaption>
          </figure>
          <figure className="rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
            <img
              src="/screenshots/prep-page.png"
              alt="Prep page for a single job posting"
              className="w-full h-auto block bg-ink-100 dark:bg-ink-900"
            />
            <figcaption className="p-3 text-sm text-ink-500 leading-relaxed">
              Prep page — red flags detected, cover letter starter, questions to ask, fit
              checkpoints. Same data feeds the MCP tools.
            </figcaption>
          </figure>
          <figure className="rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
            <img
              src="/screenshots/mcp-in-claude.png"
              alt="Claude Desktop calling the remote-work-radar MCP server"
              className="w-full h-auto block bg-ink-100 dark:bg-ink-900"
            />
            <figcaption className="p-3 text-sm text-ink-500 leading-relaxed">
              Claude Desktop calling <code>search_jobs</code> and <code>score_fit</code> against
              the local feed — no browser tab open.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="rounded-lg border border-ink-200 dark:border-ink-700 p-6">
        <h2 className="text-2xl font-semibold mb-3">Self-host it</h2>
        <p className="text-ink-500 mb-4">
          The whole stack is one repo. Bring a free Postgres URL (Neon or Supabase both work) and a
          few env vars.
        </p>
        <pre className="bg-ink-100 dark:bg-ink-900 rounded p-4 text-sm overflow-x-auto font-mono">
{`git clone https://github.com/Regat1ve/remote-work-radar
cd remote-work-radar
pnpm install
cp .env.example .env         # paste your DATABASE_URL
pnpm db:migrate
pnpm etl:once
pnpm dev`}
        </pre>
      </section>
    </div>
  );
}

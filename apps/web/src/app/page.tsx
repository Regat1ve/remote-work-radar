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
            <h3 className="font-semibold mb-2">Claude Code users</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              The MCP server lets Claude Code do the boring parts: search jobs matching your
              profile, score fit, draft cover letters, and track which ones you applied to. Bring
              your own model.
            </p>
          </div>
        </div>
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
                normalized into a common shape — timezone, hourly range, contract type, skills.
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
              <p className="font-medium">Cover letters get drafted honestly.</p>
              <p className="text-sm text-ink-500 mt-1">
                The templates open with &quot;I&apos;m early in my remote career and here&apos;s
                why this role fits&quot; — not fake seniority. Honesty converts better than
                fabrication.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="rounded-lg border border-ink-200 dark:border-ink-700 p-6">
        <h2 className="text-2xl font-semibold mb-3">Self-host it</h2>
        <p className="text-ink-500 mb-4">
          The whole stack is one repo. Bring a Postgres URL and a few env vars.
        </p>
        <pre className="bg-ink-100 dark:bg-ink-900 rounded p-4 text-sm overflow-x-auto font-mono">
{`git clone https://github.com/Regat1ve/remote-work-radar
cd remote-work-radar
pnpm install
docker compose up -d
cp .env.example .env
pnpm db:migrate
pnpm etl:once
pnpm dev`}
        </pre>
      </section>
    </div>
  );
}

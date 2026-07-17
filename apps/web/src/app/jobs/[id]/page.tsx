import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, type JobDetail } from "@/lib/jobs-query";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const advice = buildAdvice(job);

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      <header className="space-y-3">
        <Link
          href="/jobs"
          className="text-sm text-ink-400 hover:underline inline-block"
        >
          ← Back to jobs
        </Link>
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-ink-500">
          {job.company} · {job.postedAt} · seen on {job.sources.join(", ")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {job.isEntryLevel && <Chip tone="green">Entry level</Chip>}
          {job.isRemoteAnywhere && <Chip tone="blue">Remote anywhere</Chip>}
          {job.isUsOnly && <Chip tone="orange">US only</Chip>}
          {job.isScamSuspected && <Chip tone="red">⚠ Suspected scam</Chip>}
          {job.regions.map((r) => (
            <Chip key={r} tone="gray">
              {r}
            </Chip>
          ))}
          {job.skills.map((s) => (
            <Chip key={s} tone="ink">
              {s}
            </Chip>
          ))}
        </div>
        {(job.hourlyMin != null || job.salaryMin != null) && (
          <p className="text-lg">
            {job.hourlyMin != null && (
              <>
                <strong>
                  ${job.hourlyMin}
                  {job.hourlyMax && job.hourlyMax !== job.hourlyMin
                    ? `–$${job.hourlyMax}`
                    : ""}
                </strong>
                <span className="text-ink-400"> /hr</span>
              </>
            )}
            {job.salaryMin != null && (
              <>
                {job.hourlyMin != null ? " · " : ""}
                <strong>
                  ${Math.round(job.salaryMin / 1000)}k
                  {job.salaryMax && job.salaryMax !== job.salaryMin
                    ? `–$${Math.round(job.salaryMax / 1000)}k`
                    : ""}
                </strong>
                <span className="text-ink-400"> /yr</span>
              </>
            )}
          </p>
        )}
      </header>

      <section className="rounded-lg border-2 border-accent-500 dark:border-accent-400 p-6 space-y-6 bg-accent-50/50 dark:bg-accent-900/10">
        <div>
          <h2 className="text-xl font-bold mb-1">
            Prep for this application
          </h2>
          <p className="text-sm text-ink-500">
            Radar-generated advice from what we parsed out of this posting.
            Nothing is submitted for you — apply happens on{" "}
            {sourceLabel(job.sources[0])}.
          </p>
        </div>

        {advice.redFlags.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm uppercase text-ink-400 mb-2">
              Red flags to raise before you spend time
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {advice.redFlags.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-sm uppercase text-ink-400 mb-2">
            Cover letter starter (edit the [placeholders])
          </h3>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-ink-100 dark:bg-ink-800 p-4 rounded border border-ink-200 dark:border-ink-700">
            {advice.coverLetter}
          </pre>
          <p className="text-xs text-ink-400 mt-2">
            More templates in{" "}
            <Link href="/templates" className="underline">
              /templates
            </Link>
            .
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-ink-400 mb-2">
            Questions to ask them
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {advice.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase text-ink-400 mb-2">
            Fit checkpoints
          </h3>
          <ul className="space-y-1 text-sm">
            {advice.fit.map((f, i) => (
              <li key={i}>
                <span className="font-mono text-xs mr-2">{f.mark}</span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-accent-200 dark:border-accent-700">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded bg-accent-600 hover:bg-accent-700 text-white font-semibold px-4 py-2 text-sm"
          >
            Open apply on {sourceLabel(job.sources[0])} →
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Full description</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {job.descriptionMd}
        </div>
      </section>
    </article>
  );
}

function sourceLabel(slug: string | undefined): string {
  if (!slug) return "the source";
  return (
    {
      "hn-who-is-hiring": "Hacker News",
      remoteok: "RemoteOK",
      weworkremotely: "WeWorkRemotely",
    }[slug] ?? slug
  );
}

type Advice = {
  redFlags: string[];
  coverLetter: string;
  questions: string[];
  fit: { mark: string; text: string }[];
};

function buildAdvice(j: JobDetail): Advice {
  const redFlags: string[] = [];
  if (j.isScamSuspected) {
    redFlags.push(
      `Radar flagged this as a suspected scam: ${j.scamReasons.join("; ")}. Do NOT pay anything up front.`
    );
  }
  if (j.hourlyMin == null && j.salaryMin == null) {
    redFlags.push(
      "No rate stated. Ask about budget in the FIRST message, before writing a test task."
    );
  }
  if (j.isUsOnly) {
    redFlags.push(
      "Marked US-only. Some teams still take contractors from other jurisdictions — worth a one-line ask, but don't invest heavily until confirmed."
    );
  }
  if (j.paymentMethodsHint.includes("payoneer")) {
    redFlags.push(
      "Employer mentions Payoneer. If you're in RU/BY/IR/CU, Payoneer is blocked — negotiate USDC or Wise before signing."
    );
  }

  const topSkills = j.skills.slice(0, 3);
  const skillsLine = topSkills.length
    ? `I've been building with ${topSkills.join(", ")}`
    : "I've been shipping full-stack work with AI-native tooling (Claude Code, Prisma, Next.js)";
  const whyFit = j.isEntryLevel
    ? "the posting is explicit about being open to earlier-career candidates, which matches where I am"
    : j.isRemoteAnywhere
      ? "it's fully remote-anywhere, which is what I'm optimizing for"
      : `the stack overlaps closely with what I've been in day-to-day`;
  const rateLine =
    j.hourlyMin != null
      ? `I'm targeting $${j.hourlyMin}${j.hourlyMax && j.hourlyMax !== j.hourlyMin ? `–$${j.hourlyMax}` : ""}/hr for this kind of scope, which fits your posted range.`
      : "I'm open to $30–50/hr for scope like this — happy to align once we compare details.";

  const coverLetter = `Hi ${j.company},

I saw the ${j.title} post and wanted to reach out. ${skillsLine} — [ONE-LINE PROJECT: e.g. "shipped a marketplace on Vite + Express + Postgres serving a real caseload"] — and this looks like a fit because ${whyFit}.

${rateLine} EU + US-East hours, async-friendly.

Portfolio: [YOUR PORTFOLIO URL]
GitHub: [YOUR GITHUB URL]

Would love to discuss.

Best,
[YOUR NAME]`;

  const questions: string[] = [
    "What does async collaboration actually look like — daily standup, or fully written?",
    "What timezone overlap do you need from this role, and what hours are hard requirements?",
    "Payment cadence — bi-weekly, monthly, or per-milestone? Which payment rails do you support?",
    "What's the contract term you're thinking — 3 months, 6, open-ended?",
  ];
  if (j.isEntryLevel) {
    questions.push(
      "What onboarding support is there for the first 30 days? Is there a senior I'd be paired with?"
    );
  }
  if (j.isUsOnly) {
    questions.push(
      "Is US-only a hard requirement, or would you consider a strong contractor from EU / LATAM?"
    );
  }
  if (topSkills.length === 0) {
    questions.push(
      "What's the actual day-to-day stack? The posting is light on tech specifics."
    );
  } else {
    questions.push(
      `Which of {${topSkills.join(", ")}} is most load-bearing on this role in the first 60 days?`
    );
  }

  const fit: { mark: string; text: string }[] = [];
  if (j.hourlyMin != null) {
    fit.push({
      mark: "$",
      text: `Rate range is transparent (${j.hourlyMin}${j.hourlyMax && j.hourlyMax !== j.hourlyMin ? `–${j.hourlyMax}` : ""}/hr) — the team is serious about paying.`,
    });
  }
  if (j.isRemoteAnywhere) {
    fit.push({ mark: "🌍", text: "Fully remote-anywhere — no location gate." });
  }
  if (topSkills.length > 0) {
    fit.push({
      mark: "🧰",
      text: `Detected stack: ${topSkills.join(", ")}. Lead your reply with a project using at least one of these.`,
    });
  }
  if (j.timezoneMinUtcOffset != null && j.timezoneMaxUtcOffset != null) {
    fit.push({
      mark: "🕐",
      text: `Required timezone overlap parsed as UTC ${j.timezoneMinUtcOffset >= 0 ? "+" : ""}${j.timezoneMinUtcOffset} to UTC ${j.timezoneMaxUtcOffset >= 0 ? "+" : ""}${j.timezoneMaxUtcOffset}.`,
    });
  }
  if (j.requiredExperienceYears != null) {
    fit.push({
      mark: "📅",
      text: `Asks for ${j.requiredExperienceYears}+ years. If you're under that, lead the letter with shipped work — outcomes beat years on remote roles.`,
    });
  }
  if (fit.length === 0) {
    fit.push({
      mark: "•",
      text: "Posting is light on structured info — treat the first message as your discovery call.",
    });
  }

  return { redFlags, coverLetter, questions, fit };
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "blue" | "orange" | "red" | "gray" | "ink";
}) {
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    gray: "bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-200",
    ink: "bg-ink-200 text-ink-700 dark:bg-ink-700 dark:text-ink-100 font-mono",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs ${styles[tone]}`}>
      {children}
    </span>
  );
}

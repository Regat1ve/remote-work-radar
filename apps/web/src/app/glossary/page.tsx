import { byCategory, GLOSSARY } from "@/lib/glossary";

const CATEGORY_TITLES: Record<string, string> = {
  compensation: "How you get paid",
  contract: "What kind of role it is",
  workflow: "How the team works",
  money: "How money crosses borders",
  "red-flags": "Red flags — walk away",
};

export const metadata = {
  title: "Glossary — remote-work-radar",
  description:
    "Plain-English definitions for every term a remote job posting uses. Hourly vs retainer, async, timezone overlap, USDC, Deel, and the scam patterns to walk away from.",
};

export default function GlossaryPage() {
  const grouped = byCategory();
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-3">Glossary</h1>
      <p className="text-ink-500 mb-10">
        Every term a remote job posting is going to use, explained in one paragraph. If you find one
        we missed,{" "}
        <a
          href="https://github.com/Regat1ve/remote-work-radar/issues/new"
          className="underline text-accent-600"
        >
          open an issue
        </a>
        .
      </p>
      <div className="space-y-10 prose-rwr">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) => (
          <section key={cat}>
            <h2 id={cat}>{CATEGORY_TITLES[cat] ?? cat}</h2>
            <dl className="space-y-6">
              {grouped[cat].map((t) => (
                <div key={t.slug} id={t.slug}>
                  <dt className="font-semibold" dangerouslySetInnerHTML={{ __html: t.term }} />
                  <dd className="text-sm text-ink-400 italic mt-0.5">{t.short}</dd>
                  <dd
                    className="text-ink-500 mt-2"
                    dangerouslySetInnerHTML={{ __html: t.long }}
                  />
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="mt-16 text-xs text-ink-400">
        {GLOSSARY.length} terms · Fork this list at{" "}
        <a
          href="https://github.com/Regat1ve/remote-work-radar/blob/master/apps/web/src/lib/glossary.ts"
          className="underline"
        >
          apps/web/src/lib/glossary.ts
        </a>
      </p>
    </div>
  );
}

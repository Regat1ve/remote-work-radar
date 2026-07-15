import { TEMPLATES } from "@/lib/templates";

export const metadata = {
  title: "Cover letter templates — remote-work-radar",
  description:
    "Four honest cover letter templates. No fake seniority. One for first-timers, one for career switchers, one for locked-out senior devs, and a 6-line version for busy founders.",
};

export default function TemplatesPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-3">Cover letter templates</h1>
      <p className="text-ink-500 mb-8">
        Four templates. Each one is optimised for a specific situation. None of them pretend you
        have experience you do not have — honesty beats fabrication when the reader has read fifty
        letters this morning.
      </p>

      <nav className="grid grid-cols-2 gap-3 mb-10">
        {TEMPLATES.map((t) => (
          <a
            key={t.slug}
            href={`#${t.slug}`}
            className="rounded-md border border-ink-200 dark:border-ink-700 p-3 hover:border-accent-600"
          >
            <p className="font-medium text-sm">{t.title}</p>
            <p className="text-xs text-ink-400 mt-1">{t.audience}</p>
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {TEMPLATES.map((t) => (
          <section key={t.slug} id={t.slug}>
            <h2 className="text-2xl font-semibold mb-1">{t.title}</h2>
            <p className="text-sm text-ink-400 mb-2">
              <span className="font-medium">Audience:</span> {t.audience}
            </p>
            <p className="text-sm text-ink-400 mb-5">
              <span className="font-medium">When to use:</span> {t.when}
            </p>
            <pre className="bg-ink-100 dark:bg-ink-900 rounded-md p-5 text-sm font-mono whitespace-pre-wrap leading-6 border border-ink-200 dark:border-ink-700">
              {t.body}
            </pre>
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">How to fill in the blanks:</p>
              <ul className="text-sm text-ink-500 list-disc pl-5 space-y-1">
                {t.swap_notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

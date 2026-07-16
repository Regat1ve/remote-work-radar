"use client";

import Link from "next/link";
import { useState } from "react";

type Experience = "never" | "some" | "experienced" | "senior";

const RATE_HINTS: Record<Experience, string> = {
  never: "$15-$25/hr for a first contract. Rate goes up fast after the first three months.",
  some: "$25-$45/hr. Push toward the top of the range if you have shipped anything real.",
  experienced:
    "$45-$80/hr. Most locked-out senior devs on this range are underpaid — do not race to the bottom.",
  senior:
    "$70-$150/hr. If clients ping-pong you below $70, the client is the problem, not the market.",
};

const EXPERIENCE_LABELS: Record<Experience, string> = {
  never: "Never worked remote before",
  some: "Some side gigs / one contract",
  experienced: "1+ year full-time remote",
  senior: "3+ years — I know the drill",
};

function pickTemplate(exp: Experience, hasPortfolio: boolean): { slug: string; label: string } {
  if (exp === "never" || !hasPortfolio)
    return { slug: "no-portfolio", label: "First cover letter, no portfolio yet" };
  if (exp === "senior") return { slug: "senior-fast", label: "Senior, direct, 6-line version" };
  return { slug: "locked-out", label: "Locked-out dev (Upwork/Deel/Mercor said no)" };
}

export default function OnboardingPage() {
  const [exp, setExp] = useState<Experience | "">("");
  const [country, setCountry] = useState("");
  const [tz, setTz] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [hasPortfolio, setHasPortfolio] = useState<boolean | null>(null);

  const ready =
    exp !== "" && country !== "" && tz !== "" && rateMin !== "" && rateMax !== "" &&
    hasPortfolio !== null;
  const template = ready ? pickTemplate(exp as Experience, hasPortfolio!) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <h1 className="text-2xl font-bold">First time here?</h1>

      <Section title="1. How much remote work have you done?">
        <div className="space-y-2">
          {(Object.entries(EXPERIENCE_LABELS) as [Experience, string][]).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setExp(v)}
              className={`block w-full text-left rounded-md border px-4 py-3 ${
                exp === v
                  ? "border-accent-600 bg-accent-600/5"
                  : "border-ink-200 dark:border-ink-700 hover:border-accent-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="2. Where are you?">
        <label className="block text-sm mb-2">Country (ISO code or name)</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="RU, TR, IR, VE, BY, IN, PH, ..."
          className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
        />
        <label className="block text-sm mt-6 mb-2">Your UTC offset (integer)</label>
        <input
          type="number"
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          placeholder="+3 Moscow, -5 New York, +8 Beijing"
          className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
        />
      </Section>

      <Section title="3. What rate range are you targeting?">
        {exp && (
          <div className="rounded-md bg-ink-100 dark:bg-ink-700 px-4 py-3 mb-4 text-sm">
            <strong>Suggested for you:</strong> {RATE_HINTS[exp]}
          </div>
        )}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm mb-2">Min USD/hr</label>
            <input
              type="number"
              value={rateMin}
              onChange={(e) => setRateMin(e.target.value)}
              placeholder="30"
              className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-2">Max USD/hr</label>
            <input
              type="number"
              value={rateMax}
              onChange={(e) => setRateMax(e.target.value)}
              placeholder="50"
              className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
            />
          </div>
        </div>
        {rateMin && rateMax && (
          <p className="text-xs text-ink-400 mt-3">
            At {rateMin}–{rateMax}/hr and 30 hours a week, that&apos;s roughly $
            {((Number(rateMin) + Number(rateMax)) / 2) * 30 * 4} / month before taxes.
          </p>
        )}
      </Section>

      <Section title="4. Do you have a portfolio / public code?">
        <div className="grid grid-cols-2 gap-3">
          {[
            [true, "Yes — I have at least one public repo or live demo"],
            [false, "Not yet"],
          ].map(([v, label]) => (
            <button
              key={String(v)}
              onClick={() => setHasPortfolio(v as boolean)}
              className={`rounded-md border px-4 py-4 text-left ${
                hasPortfolio === v
                  ? "border-accent-600 bg-accent-600/5"
                  : "border-ink-200 dark:border-ink-700 hover:border-accent-600"
              }`}
            >
              {label as string}
            </button>
          ))}
        </div>
      </Section>

      {template && (
        <div className="rounded-md border border-accent-600 p-5 bg-accent-600/5">
          <h3 className="font-semibold mb-2">You are ready.</h3>
          <p className="text-sm mb-4">
            Based on your answers, start with this cover letter template:
          </p>
          <Link
            href={`/templates#${template.slug}`}
            onClick={() =>
              localStorage.setItem(
                "rwr:profile",
                JSON.stringify({ exp, country, tz, rateMin, rateMax, hasPortfolio }),
              )
            }
            className="inline-block rounded-md bg-accent-600 text-white px-4 py-2 text-sm font-semibold"
          >
            {template.label} →
          </Link>
          <p className="text-xs text-ink-400 mt-3">
            Then head to <Link href="/jobs" className="underline">/jobs</Link>, flip the &quot;Hide
            US-only&quot; toggle on, and start applying.
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

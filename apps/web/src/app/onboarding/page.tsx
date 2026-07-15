"use client";

import Link from "next/link";
import { useState } from "react";

type Step = 1 | 2 | 3 | 4;

type Answers = {
  experience: "" | "never" | "some" | "experienced" | "senior";
  country: string;
  targetRateMin: string;
  targetRateMax: string;
  timezoneUtc: string;
  hasPortfolio: boolean | null;
};

const EMPTY: Answers = {
  experience: "",
  country: "",
  targetRateMin: "",
  targetRateMax: "",
  timezoneUtc: "",
  hasPortfolio: null,
};

function recommendedRate(exp: Answers["experience"]): string {
  switch (exp) {
    case "never":
      return "$15-$25/hr for a first contract. Rate goes up fast after the first three months.";
    case "some":
      return "$25-$45/hr. Push toward the top of the range if you have shipped anything real.";
    case "experienced":
      return "$45-$80/hr. Most locked-out senior devs on this range are underpaid — do not race to the bottom.";
    case "senior":
      return "$70-$150/hr. If clients ping-pong you below $70, the client is the problem, not the market.";
    default:
      return "";
  }
}

function recommendedTemplate(a: Answers): { slug: string; label: string } {
  if (a.experience === "never" || a.hasPortfolio === false) {
    return { slug: "no-portfolio", label: "First cover letter, no portfolio yet" };
  }
  if (a.experience === "senior") {
    return { slug: "senior-fast", label: "Senior, direct, 6-line version" };
  }
  return { slug: "locked-out", label: "Locked-out dev (Upwork/Deel/Mercor said no)" };
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [a, setA] = useState<Answers>(EMPTY);

  function save(): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("rwr:profile", JSON.stringify(a));
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">First time here?</h1>
        <span className="text-sm text-ink-400">Step {step} / 4</span>
      </div>
      <div className="h-1 bg-ink-100 dark:bg-ink-700 rounded-full mb-10">
        <div
          className="h-1 bg-accent-600 rounded-full transition-all"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <StepCard title="How much remote work have you done?">
          <div className="space-y-2">
            {[
              { v: "never", label: "Never worked remote before" },
              { v: "some", label: "Some side gigs / one contract" },
              { v: "experienced", label: "1+ year full-time remote" },
              { v: "senior", label: "3+ years — I know the drill" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setA({ ...a, experience: opt.v as Answers["experience"] })}
                className={`block w-full text-left rounded-md border px-4 py-3 transition ${
                  a.experience === opt.v
                    ? "border-accent-600 bg-accent-600/5"
                    : "border-ink-200 dark:border-ink-700 hover:border-accent-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <NavButtons canNext={a.experience !== ""} onNext={() => setStep(2)} />
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="Where are you?">
          <label className="block text-sm mb-2">Country (ISO code or name)</label>
          <input
            type="text"
            value={a.country}
            onChange={(e) => setA({ ...a, country: e.target.value })}
            placeholder="RU, TR, IR, VE, BY, IN, PH, ..."
            className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
          />
          <label className="block text-sm mt-6 mb-2">Your UTC offset (integer)</label>
          <input
            type="number"
            value={a.timezoneUtc}
            onChange={(e) => setA({ ...a, timezoneUtc: e.target.value })}
            placeholder="+3 for Moscow, -5 for New York, +8 for Beijing"
            className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
          />
          <p className="text-xs text-ink-400 mt-3">
            We use this to score fit — a job that requires 4 hours of overlap with UTC-8 is a
            different story from Moscow (5pm-9pm) than from Manila (2am-6am).
          </p>
          <NavButtons
            canNext={a.country !== "" && a.timezoneUtc !== ""}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </StepCard>
      )}

      {step === 3 && (
        <StepCard title="What rate range are you targeting?">
          <p className="text-sm text-ink-500 mb-4">
            If you are not sure, use our starter suggestion for your level and adjust once you get
            your first offer.
          </p>
          {a.experience !== "" && (
            <div className="rounded-md bg-ink-100 dark:bg-ink-700 px-4 py-3 mb-4 text-sm">
              <strong>Suggested for you:</strong> {recommendedRate(a.experience)}
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-2">Min USD/hr</label>
              <input
                type="number"
                value={a.targetRateMin}
                onChange={(e) => setA({ ...a, targetRateMin: e.target.value })}
                placeholder="30"
                className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-2">Max USD/hr</label>
              <input
                type="number"
                value={a.targetRateMax}
                onChange={(e) => setA({ ...a, targetRateMax: e.target.value })}
                placeholder="50"
                className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2"
              />
            </div>
          </div>
          <p className="text-xs text-ink-400 mt-3">
            {a.targetRateMin && a.targetRateMax ? (
              <>
                At {a.targetRateMin}–{a.targetRateMax}/hr and 30 hours a week, that&apos;s roughly
                ${((Number(a.targetRateMin) + Number(a.targetRateMax)) / 2) * 30 * 4} / month before
                taxes. Not bad.
              </>
            ) : (
              "We'll show you the monthly estimate once you fill both fields."
            )}
          </p>
          <NavButtons
            canNext={a.targetRateMin !== "" && a.targetRateMax !== ""}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        </StepCard>
      )}

      {step === 4 && (
        <StepCard title="Do you have a portfolio / public code?">
          <p className="text-sm text-ink-500 mb-4">
            Honest answer only. This decides which cover letter template we recommend.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: true, label: "Yes — I have at least one public repo or live demo" },
              { v: false, label: "Not yet" },
            ].map((opt) => (
              <button
                key={String(opt.v)}
                onClick={() => setA({ ...a, hasPortfolio: opt.v })}
                className={`rounded-md border px-4 py-4 text-left transition ${
                  a.hasPortfolio === opt.v
                    ? "border-accent-600 bg-accent-600/5"
                    : "border-ink-200 dark:border-ink-700 hover:border-accent-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {a.hasPortfolio !== null && (
            <div className="mt-8 rounded-md border border-accent-600 p-5 bg-accent-600/5">
              <h3 className="font-semibold mb-2">You are ready.</h3>
              <p className="text-sm mb-4">
                Based on your answers, start with this cover letter template:
              </p>
              <Link
                href={`/templates#${recommendedTemplate(a).slug}`}
                onClick={save}
                className="inline-block rounded-md bg-accent-600 text-white px-4 py-2 text-sm font-semibold"
              >
                {recommendedTemplate(a).label} →
              </Link>
              <p className="text-xs text-ink-400 mt-3">
                Then head to <Link href="/jobs" className="underline">/jobs</Link>, flip the &quot;Hide
                US-only&quot; toggle on, and start applying.
              </p>
            </div>
          )}

          <NavButtons onBack={() => setStep(3)} canNext={false} onNext={() => undefined} />
        </StepCard>
      )}
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-200 dark:border-ink-700 p-6">
      <h2 className="text-xl font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  canNext,
}: {
  onBack?: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="mt-8 flex justify-between">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-sm text-ink-500 hover:text-ink-900 dark:hover:text-ink-50"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      {canNext && (
        <button
          onClick={onNext}
          className="rounded-md bg-accent-600 text-white px-4 py-2 text-sm font-semibold"
        >
          Next →
        </button>
      )}
    </div>
  );
}

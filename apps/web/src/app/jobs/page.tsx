"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MOCK_JOBS, type MockJob } from "@/lib/mock-jobs";

type Filters = {
  hideUsOnly: boolean;
  showScamSuspected: boolean;
  entryLevelOnly: boolean;
  minHourly: string;
  search: string;
};

const INITIAL: Filters = {
  hideUsOnly: true,
  showScamSuspected: false,
  entryLevelOnly: false,
  minHourly: "",
  search: "",
};

export default function JobsPage() {
  const [f, setF] = useState<Filters>(INITIAL);

  const filtered = useMemo(() => {
    return MOCK_JOBS.filter((j) => {
      if (f.hideUsOnly && j.isUsOnly) return false;
      if (!f.showScamSuspected && j.isScamSuspected) return false;
      if (f.entryLevelOnly && !j.isEntryLevel) return false;
      if (f.minHourly && (j.hourlyMin ?? 0) < Number(f.minHourly)) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        const hay = `${j.title} ${j.company} ${j.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [f]);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase text-ink-400 mb-3">Filters</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.hideUsOnly}
                onChange={(e) => setF({ ...f, hideUsOnly: e.target.checked })}
              />
              Hide US-only postings
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.entryLevelOnly}
                onChange={(e) => setF({ ...f, entryLevelOnly: e.target.checked })}
              />
              Entry-level only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.showScamSuspected}
                onChange={(e) => setF({ ...f, showScamSuspected: e.target.checked })}
              />
              Show suspected scams (default: hidden)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase text-ink-400 mb-2">
            Min hourly (USD)
          </label>
          <input
            type="number"
            value={f.minHourly}
            onChange={(e) => setF({ ...f, minHourly: e.target.value })}
            placeholder="30"
            className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase text-ink-400 mb-2">Search</label>
          <input
            type="text"
            value={f.search}
            onChange={(e) => setF({ ...f, search: e.target.value })}
            placeholder="nextjs, python, ..."
            className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="text-xs text-ink-400 pt-4 border-t border-ink-200 dark:border-ink-700">
          This preview uses 6 mock postings so you can see the filters work.
          <br />
          Real ETL pulls ~500 postings/day.{" "}
          <Link href="/" className="underline">
            Self-host
          </Link>{" "}
          for live data.
        </div>
      </aside>

      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
          </h1>
          <p className="text-xs text-ink-400">
            {MOCK_JOBS.length - filtered.length} hidden by filters
          </p>
        </div>
        <div className="space-y-3">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-md border border-dashed border-ink-200 dark:border-ink-700 p-8 text-center text-sm text-ink-400">
              No jobs match your filters. Try loosening them.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: MockJob }) {
  return (
    <article
      className={`rounded-lg border p-5 ${
        job.isScamSuspected
          ? "border-red-400 bg-red-50 dark:bg-red-900/20"
          : "border-ink-200 dark:border-ink-700"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{job.title}</h3>
          <p className="text-sm text-ink-500 mt-0.5">
            {job.company} · {job.postedAt}
          </p>
        </div>
        {job.hourlyMin != null && (
          <p className="text-right whitespace-nowrap">
            <span className="font-semibold">
              ${job.hourlyMin}–${job.hourlyMax}
            </span>
            <span className="text-xs text-ink-400"> /hr</span>
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.isEntryLevel && <Badge tone="green">Entry level</Badge>}
        {job.isRemoteAnywhere && <Badge tone="blue">Remote anywhere</Badge>}
        {job.isUsOnly && <Badge tone="orange">US only</Badge>}
        {job.isScamSuspected && (
          <Badge tone="red" title={job.scamReasons.join(", ")}>
            ⚠ Suspected scam
          </Badge>
        )}
        {job.regions.map((r) => (
          <Badge key={r} tone="gray">
            {r}
          </Badge>
        ))}
        {job.skills.map((s) => (
          <Badge key={s} tone="ink">
            {s}
          </Badge>
        ))}
      </div>

      {job.isScamSuspected && (
        <p className="text-sm text-red-700 dark:text-red-300 mt-3">
          <strong>Why flagged:</strong> {job.scamReasons.join("; ")}. See{" "}
          <Link href="/glossary#red-flags" className="underline">
            red-flag rules
          </Link>
          .
        </p>
      )}

      <div className="mt-4 flex justify-between items-center text-sm">
        <p className="text-ink-400 text-xs">
          Seen on: {job.sources.join(", ")}
        </p>
        {!job.isScamSuspected && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent-600 font-medium hover:underline"
          >
            Apply →
          </a>
        )}
      </div>
    </article>
  );
}

function Badge({
  children,
  tone,
  title,
}: {
  children: React.ReactNode;
  tone: "green" | "blue" | "orange" | "red" | "gray" | "ink";
  title?: string;
}) {
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    gray: "bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-200",
    ink: "bg-ink-200 text-ink-700 dark:bg-ink-700 dark:text-ink-100 font-mono",
  };
  return (
    <span
      title={title}
      className={`inline-block rounded px-2 py-0.5 text-xs ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

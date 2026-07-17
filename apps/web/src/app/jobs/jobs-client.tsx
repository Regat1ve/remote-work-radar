"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import type { JobCardShape } from "@/lib/jobs-query";

type Filters = {
  hideUsOnly: boolean;
  showScamSuspected: boolean;
  entryLevelOnly: boolean;
  minHourly: string;
  search: string;
};

function readFilters(sp: URLSearchParams): Filters {
  return {
    hideUsOnly: sp.get("hideUsOnly") !== "0",
    showScamSuspected: sp.get("showScamSuspected") === "1",
    entryLevelOnly: sp.get("entryLevelOnly") === "1",
    minHourly: sp.get("minHourly") ?? "",
    search: sp.get("search") ?? "",
  };
}

export function JobsClient({
  jobs,
  totalCount,
  categoryCounts,
  activeCategory,
}: {
  jobs: JobCardShape[];
  totalCount: number;
  categoryCounts: Record<CategoryKey, number>;
  activeCategory: CategoryKey | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const f = readFilters(new URLSearchParams(searchParams.toString()));

  function update(next: Partial<Filters>) {
    const sp = new URLSearchParams(searchParams.toString());
    const merged = { ...f, ...next };
    if (merged.hideUsOnly) sp.delete("hideUsOnly");
    else sp.set("hideUsOnly", "0");
    if (merged.showScamSuspected) sp.set("showScamSuspected", "1");
    else sp.delete("showScamSuspected");
    if (merged.entryLevelOnly) sp.set("entryLevelOnly", "1");
    else sp.delete("entryLevelOnly");
    if (merged.minHourly) sp.set("minHourly", merged.minHourly);
    else sp.delete("minHourly");
    if (merged.search) sp.set("search", merged.search);
    else sp.delete("search");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setCategory(cat: CategoryKey | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (cat) sp.set("category", cat);
    else sp.delete("category");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <nav
        aria-label="Job categories"
        className="flex flex-wrap gap-1.5 border-b border-ink-200 dark:border-ink-700 pb-3"
      >
        <CategoryTab
          label="All"
          count={totalCount}
          active={activeCategory === null}
          onClick={() => setCategory(null)}
        />
        {CATEGORIES.map((c) => (
          <CategoryTab
            key={c.key}
            label={c.label}
            count={categoryCounts[c.key] ?? 0}
            active={activeCategory === c.key}
            onClick={() => setCategory(c.key)}
          />
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase text-ink-400 mb-3">Filters</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.hideUsOnly}
                  onChange={(e) => update({ hideUsOnly: e.target.checked })}
                />
                Hide US-only postings
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.entryLevelOnly}
                  onChange={(e) => update({ entryLevelOnly: e.target.checked })}
                />
                Entry-level only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.showScamSuspected}
                  onChange={(e) => update({ showScamSuspected: e.target.checked })}
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
              onChange={(e) => update({ minHourly: e.target.value })}
              placeholder="30"
              className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase text-ink-400 mb-2">
              Search
            </label>
            <input
              type="text"
              value={f.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="nextjs, python, ..."
              className="w-full rounded-md border border-ink-200 dark:border-ink-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="text-xs text-ink-400 pt-4 border-t border-ink-200 dark:border-ink-700">
            {totalCount} remote jobs total. Use the tabs above to narrow to a role type.
            <br />
            ETL refreshes every 15 minutes.
          </div>
        </aside>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
              {activeCategory && (
                <span className="text-ink-400 text-lg font-normal">
                  {" "}
                  · {CATEGORIES.find((c) => c.key === activeCategory)?.label}
                </span>
              )}
            </h1>
          </div>
          <div className="space-y-3">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
            {jobs.length === 0 && (
              <div className="rounded-md border border-dashed border-ink-200 dark:border-ink-700 p-8 text-center text-sm text-ink-400">
                No jobs match. Try a different category or loosen the filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm transition ${
        active
          ? "bg-accent-600 text-white"
          : "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700"
      }`}
    >
      {label}
      <span className={`ml-1.5 text-xs ${active ? "opacity-80" : "opacity-60"}`}>
        {count}
      </span>
    </button>
  );
}

function JobCard({ job }: { job: JobCardShape }) {
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
              ${job.hourlyMin}
              {job.hourlyMax && job.hourlyMax !== job.hourlyMin ? `–$${job.hourlyMax}` : ""}
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
        {job.skills.slice(0, 6).map((s) => (
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
        <p className="text-ink-400 text-xs">Seen on: {job.sources.join(", ")}</p>
        {!job.isScamSuspected && (
          <Link
            href={`/jobs/${job.id}`}
            className="text-accent-600 font-medium hover:underline"
          >
            Prep & apply →
          </Link>
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

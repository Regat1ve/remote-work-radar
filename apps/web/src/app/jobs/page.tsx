import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { jobsCount, listJobs, type JobsFilters } from "@/lib/jobs-query";
import { JobsClient } from "./jobs-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — remote-work-radar",
  description:
    "Live dev / AI-engineer remote job postings from WeWorkRemotely, RemoteOK, and HN Who is hiring. US-only postings hidden by default. Suspected scams flagged.",
};

function parseFilters(sp: {
  [k: string]: string | string[] | undefined;
}): JobsFilters {
  const category = typeof sp.category === "string"
    ? (CATEGORIES.find((c) => c.key === sp.category)?.key)
    : undefined;
  const minHourly = typeof sp.minHourly === "string" && sp.minHourly
    ? Number(sp.minHourly)
    : undefined;
  return {
    hideUsOnly: sp.hideUsOnly !== "0",
    showScamSuspected: sp.showScamSuspected === "1",
    entryLevelOnly: sp.entryLevelOnly === "1",
    minHourly: Number.isFinite(minHourly) ? minHourly : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
    category: category as CategoryKey | undefined,
    limit: 50,
  };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [jobs, totalCount, categoryCounts] = await Promise.all([
    listJobs(filters),
    jobsCount({ ...filters, category: undefined }),
    Promise.all(
      CATEGORIES.map((c) =>
        jobsCount({ ...filters, category: c.key }).then((n) => [c.key, n] as const),
      ),
    ),
  ]);
  const counts = Object.fromEntries(categoryCounts) as Record<CategoryKey, number>;
  return (
    <JobsClient
      jobs={jobs}
      totalCount={totalCount}
      categoryCounts={counts}
      activeCategory={filters.category ?? null}
    />
  );
}

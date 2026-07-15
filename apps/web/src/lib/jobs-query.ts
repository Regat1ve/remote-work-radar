import "server-only";
import { prisma } from "@rwr/db";

export type JobsFilters = {
  hideUsOnly?: boolean;
  showScamSuspected?: boolean;
  entryLevelOnly?: boolean;
  minHourly?: number;
  search?: string;
  limit?: number;
};

export type JobCardShape = {
  id: string;
  title: string;
  company: string;
  postedAt: string;
  hourlyMin: number | null;
  hourlyMax: number | null;
  isUsOnly: boolean;
  isRemoteAnywhere: boolean;
  isEntryLevel: boolean;
  isScamSuspected: boolean;
  scamReasons: string[];
  regions: string[];
  skills: string[];
  sources: string[];
  applyUrl: string;
};

function formatPostedAt(d: Date | null): string {
  if (!d) return "recently";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export async function listJobs(filters: JobsFilters = {}): Promise<JobCardShape[]> {
  const limit = filters.limit ?? 50;

  const rows = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(filters.hideUsOnly ? { isUsOnly: false } : {}),
      ...(filters.showScamSuspected ? {} : { isScamSuspected: false }),
      ...(filters.entryLevelOnly ? { isEntryLevel: true } : {}),
      ...(filters.minHourly !== undefined
        ? { hourlyMinUsd: { gte: filters.minHourly } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { titleNormalized: { contains: filters.search.toLowerCase() } },
              { descriptionMd: { contains: filters.search, mode: "insensitive" } },
              { company: { nameNormalized: { contains: filters.search.toLowerCase() } } },
            ],
          }
        : {}),
    },
    orderBy: [{ postedAt: "desc" }, { firstSeenAt: "desc" }],
    take: limit,
    include: {
      company: true,
      skills: { include: { skill: true } },
      sourceRefs: { include: { source: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.titleOriginal,
    company: r.company.name,
    postedAt: formatPostedAt(r.postedAt),
    hourlyMin: r.hourlyMinUsd ? Number(r.hourlyMinUsd) : null,
    hourlyMax: r.hourlyMaxUsd ? Number(r.hourlyMaxUsd) : null,
    isUsOnly: r.isUsOnly,
    isRemoteAnywhere: r.isRemoteAnywhere,
    isEntryLevel: r.isEntryLevel,
    isScamSuspected: r.isScamSuspected,
    scamReasons: r.scamReasons,
    regions: r.allowedRegions,
    skills: r.skills.map((s) => s.skill.slug),
    sources: r.sourceRefs.map((s) => s.source.slug),
    applyUrl: r.applyUrl,
  }));
}

export async function jobsCount(): Promise<number> {
  return prisma.job.count({ where: { isActive: true } });
}

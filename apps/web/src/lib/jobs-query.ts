import "server-only";
import { prisma } from "@rwr/db";
import type { Prisma } from "@rwr/db";
import { CATEGORIES, type CategoryKey } from "./categories";

export type JobsFilters = {
  hideUsOnly?: boolean;
  showScamSuspected?: boolean;
  entryLevelOnly?: boolean;
  minHourly?: number;
  search?: string;
  limit?: number;
  includeNonDev?: boolean;
  category?: CategoryKey;
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

export type JobDetail = JobCardShape & {
  descriptionMd: string;
  companyNameNormalized: string;
  salaryMin: number | null;
  salaryMax: number | null;
  paymentTypes: string[];
  contractTypes: string[];
  paymentMethodsHint: string[];
  requiredExperienceYears: number | null;
  timezoneMinUtcOffset: number | null;
  timezoneMaxUtcOffset: number | null;
  sourceUrl: string;
};

// Substrings ILIKE'd against Job.titleOriginal. Short tokens like "CTO", "AI",
// "SRE", "SWE" are intentionally excluded — as substrings they match "direCTOr",
// "detAIled", etc. Devs post their title with a full word almost always, so the
// long tokens below cover the real signal without the false positives.
const DEV_TITLE_KEYWORDS = [
  "engineer",
  "developer",
  "programmer",
  "coder",
  "architect",
  "founding",
  "technologist",
  "devops",
  "LLM",
  "data scientist",
  "research scientist",
  "applied scientist",
  "machine learning",
  "technical lead",
  "tech lead",
  "product engineer",
  "front-end",
  "back-end",
  "full-stack",
  "fullstack",
  "backend",
  "frontend",
];

function devRoleClause(): Prisma.JobWhereInput {
  return {
    OR: DEV_TITLE_KEYWORDS.map((kw) => ({
      titleOriginal: { contains: kw, mode: "insensitive" as const },
    })),
  };
}

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

function baseWhere(filters: JobsFilters): Prisma.JobWhereInput {
  const and: Prisma.JobWhereInput[] = [];

  if (!filters.includeNonDev) {
    and.push(devRoleClause());
  }

  if (filters.category) {
    const cat = CATEGORIES.find((c) => c.key === filters.category);
    if (cat) {
      and.push({
        OR: cat.keywords.map((kw) => ({
          titleOriginal: { contains: kw, mode: "insensitive" as const },
        })),
      });
    }
  }

  if (filters.search) {
    and.push({
      OR: [
        { titleNormalized: { contains: filters.search.toLowerCase() } },
        { descriptionMd: { contains: filters.search, mode: "insensitive" } },
        {
          company: {
            nameNormalized: { contains: filters.search.toLowerCase() },
          },
        },
      ],
    });
  }

  return {
    isActive: true,
    ...(filters.hideUsOnly ? { isUsOnly: false } : {}),
    ...(filters.showScamSuspected ? {} : { isScamSuspected: false }),
    ...(filters.entryLevelOnly ? { isEntryLevel: true } : {}),
    ...(filters.minHourly !== undefined
      ? { hourlyMinUsd: { gte: filters.minHourly } }
      : {}),
    ...(and.length ? { AND: and } : {}),
  };
}

export async function listJobs(filters: JobsFilters = {}): Promise<JobCardShape[]> {
  const limit = filters.limit ?? 50;

  const rows = await prisma.job.findMany({
    where: baseWhere(filters),
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

export async function jobsCount(filters: JobsFilters = {}): Promise<number> {
  return prisma.job.count({ where: baseWhere(filters) });
}

export async function getJob(id: string): Promise<JobDetail | null> {
  const r = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      skills: { include: { skill: true } },
      sourceRefs: { include: { source: true } },
    },
  });
  if (!r) return null;

  return {
    id: r.id,
    title: r.titleOriginal,
    company: r.company.name,
    companyNameNormalized: r.company.nameNormalized,
    postedAt: formatPostedAt(r.postedAt),
    hourlyMin: r.hourlyMinUsd ? Number(r.hourlyMinUsd) : null,
    hourlyMax: r.hourlyMaxUsd ? Number(r.hourlyMaxUsd) : null,
    salaryMin: r.salaryMinUsd ? Number(r.salaryMinUsd) : null,
    salaryMax: r.salaryMaxUsd ? Number(r.salaryMaxUsd) : null,
    paymentTypes: r.paymentTypes,
    contractTypes: r.contractTypes,
    paymentMethodsHint: r.paymentMethodsHint,
    requiredExperienceYears: r.requiredExperienceYears,
    timezoneMinUtcOffset: r.timezoneMinUtcOffset,
    timezoneMaxUtcOffset: r.timezoneMaxUtcOffset,
    isUsOnly: r.isUsOnly,
    isRemoteAnywhere: r.isRemoteAnywhere,
    isEntryLevel: r.isEntryLevel,
    isScamSuspected: r.isScamSuspected,
    scamReasons: r.scamReasons,
    regions: r.allowedRegions,
    skills: r.skills.map((s) => s.skill.slug),
    sources: r.sourceRefs.map((s) => s.source.slug),
    applyUrl: r.applyUrl,
    sourceUrl: r.sourceRefs[0]?.sourceUrl ?? r.applyUrl,
    descriptionMd: r.descriptionMd,
  };
}

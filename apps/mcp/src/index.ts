#!/usr/bin/env node
/**
 * remote-work-radar MCP server.
 *
 * Hits the same Postgres as the web app (DATABASE_URL). No auth — one server
 * per user, run locally, so per-user filtering happens on the client side.
 *
 * Tools:
 *   - search_jobs(query?, category?, minHourly?, remoteAnywhere?, entryLevel?, limit?)
 *   - get_job(id)
 *   - score_fit(jobId, skills[], targetHourly?)
 *   - draft_cover_letter(jobId, userName, userPortfolio?, oneLineProject?)
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { prisma } from "@rwr/db";
import { z } from "zod";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "ai-ml": [
    "AI engineer",
    "AI research",
    "applied AI",
    "AI/ML",
    "ML engineer",
    "machine learning",
    "LLM",
    "voice AI",
    "agent builder",
    "research scientist",
    "applied scientist",
    "data scientist",
  ],
  frontend: [
    "frontend",
    "front-end",
    "react",
    "next.js",
    "vue",
    "design engineer",
    "UI engineer",
  ],
  backend: [
    "backend",
    "back-end",
    "platform engineer",
    "infrastructure engineer",
    "distributed",
    "scanning",
    "API engineer",
    "systems engineer",
    "reliability engineer",
  ],
  fullstack: ["fullstack", "full-stack", "product engineer", "software engineer"],
  devops: ["devops", "site reliability", "cloud engineer", "kubernetes engineer"],
  data: ["data engineer", "analytics engineer", "ETL"],
  mobile: [
    "iOS engineer",
    "android engineer",
    "mobile engineer",
    "react native",
    "flutter",
  ],
  lead: [
    "founding",
    "technical lead",
    "tech lead",
    "principal engineer",
    "staff engineer",
    "head of engineering",
  ],
};

const SearchInput = z.object({
  query: z.string().optional().describe("Free-text search over title, company, description."),
  category: z
    .enum([
      "ai-ml",
      "frontend",
      "backend",
      "fullstack",
      "devops",
      "data",
      "mobile",
      "lead",
    ])
    .optional()
    .describe("Role category. Omit for all remote jobs."),
  minHourly: z.number().optional().describe("Minimum hourly USD."),
  remoteAnywhere: z.boolean().optional().describe("Only fully remote-anywhere postings."),
  entryLevel: z.boolean().optional().describe("Only entry-level friendly."),
  hideUsOnly: z.boolean().optional().default(true).describe("Hide US-only. Default: true."),
  limit: z.number().optional().default(20).describe("Max rows. Default: 20."),
});

const GetJobInput = z.object({ id: z.string() });

const ScoreFitInput = z.object({
  jobId: z.string(),
  skills: z.array(z.string()).describe("Your skill tags (e.g. ['python','react','postgres'])."),
  targetHourly: z.number().optional().describe("Your target hourly rate USD."),
});

const DraftLetterInput = z.object({
  jobId: z.string(),
  userName: z.string(),
  userPortfolio: z.string().optional(),
  oneLineProject: z
    .string()
    .optional()
    .describe("One line about a project you shipped, to lead with."),
});

function jsonToolResult(payload: unknown, help: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ _help: help, data: payload }, null, 2),
      },
    ],
  };
}

async function searchJobs(input: z.infer<typeof SearchInput>) {
  const and: any[] = [];
  if (input.category) {
    and.push({
      OR: CATEGORY_KEYWORDS[input.category].map((kw) => ({
        titleOriginal: { contains: kw, mode: "insensitive" as const },
      })),
    });
  }
  if (input.query) {
    and.push({
      OR: [
        { titleNormalized: { contains: input.query.toLowerCase() } },
        { descriptionMd: { contains: input.query, mode: "insensitive" as const } },
        { company: { nameNormalized: { contains: input.query.toLowerCase() } } },
      ],
    });
  }
  const rows = await prisma.job.findMany({
    where: {
      isActive: true,
      isScamSuspected: false,
      ...(input.hideUsOnly ? { isUsOnly: false } : {}),
      ...(input.remoteAnywhere ? { isRemoteAnywhere: true } : {}),
      ...(input.entryLevel ? { isEntryLevel: true } : {}),
      ...(input.minHourly !== undefined ? { hourlyMinUsd: { gte: input.minHourly } } : {}),
      ...(and.length ? { AND: and } : {}),
    },
    orderBy: [{ postedAt: "desc" }, { firstSeenAt: "desc" }],
    take: input.limit,
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
    postedAt: r.postedAt,
    hourlyMin: r.hourlyMinUsd ? Number(r.hourlyMinUsd) : null,
    hourlyMax: r.hourlyMaxUsd ? Number(r.hourlyMaxUsd) : null,
    isEntryLevel: r.isEntryLevel,
    isRemoteAnywhere: r.isRemoteAnywhere,
    isUsOnly: r.isUsOnly,
    regions: r.allowedRegions,
    skills: r.skills.map((s) => s.skill.slug),
    sources: r.sourceRefs.map((s) => s.source.slug),
    applyUrl: r.applyUrl,
  }));
}

async function getJob(id: string) {
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
    postedAt: r.postedAt,
    descriptionMd: r.descriptionMd,
    hourlyMin: r.hourlyMinUsd ? Number(r.hourlyMinUsd) : null,
    hourlyMax: r.hourlyMaxUsd ? Number(r.hourlyMaxUsd) : null,
    salaryMin: r.salaryMinUsd ? Number(r.salaryMinUsd) : null,
    salaryMax: r.salaryMaxUsd ? Number(r.salaryMaxUsd) : null,
    isEntryLevel: r.isEntryLevel,
    isRemoteAnywhere: r.isRemoteAnywhere,
    isUsOnly: r.isUsOnly,
    isScamSuspected: r.isScamSuspected,
    scamReasons: r.scamReasons,
    requiredExperienceYears: r.requiredExperienceYears,
    timezoneMinUtcOffset: r.timezoneMinUtcOffset,
    timezoneMaxUtcOffset: r.timezoneMaxUtcOffset,
    paymentMethodsHint: r.paymentMethodsHint,
    regions: r.allowedRegions,
    skills: r.skills.map((s) => s.skill.slug),
    sources: r.sourceRefs.map((s) => s.source.slug),
    applyUrl: r.applyUrl,
  };
}

async function scoreFit(input: z.infer<typeof ScoreFitInput>) {
  const job = await getJob(input.jobId);
  if (!job) return { error: "job not found" };

  const jobSkills = new Set(job.skills);
  const userSkills = new Set(input.skills.map((s) => s.toLowerCase()));
  const overlap = [...jobSkills].filter((s) => userSkills.has(s.toLowerCase()));
  const skillsScore = jobSkills.size === 0 ? 50 : Math.round((overlap.length / jobSkills.size) * 100);

  let rateScore = 100;
  if (input.targetHourly !== undefined && job.hourlyMin != null) {
    if (job.hourlyMax != null && input.targetHourly > job.hourlyMax) rateScore = 30;
    else if (input.targetHourly > (job.hourlyMax ?? job.hourlyMin)) rateScore = 60;
    else if (input.targetHourly < job.hourlyMin * 0.7) rateScore = 70;
  }

  const flags: string[] = [];
  if (job.isUsOnly) flags.push("US-only — may block you");
  if (job.isScamSuspected) flags.push(`⚠ suspected scam: ${job.scamReasons.join(", ")}`);
  if (job.hourlyMin == null && job.salaryMin == null) flags.push("no rate stated");
  if (job.requiredExperienceYears != null && job.requiredExperienceYears >= 5)
    flags.push(`asks for ${job.requiredExperienceYears}+ years`);

  const overall = Math.round((skillsScore * 0.7 + rateScore * 0.3));
  return {
    overall,
    skillsScore,
    rateScore,
    skillsOverlap: overlap,
    missingSkills: [...jobSkills].filter((s) => !userSkills.has(s.toLowerCase())),
    flags,
  };
}

async function draftCoverLetter(input: z.infer<typeof DraftLetterInput>) {
  const job = await getJob(input.jobId);
  if (!job) return { error: "job not found" };

  const topSkills = job.skills.slice(0, 3);
  const skillsLine = topSkills.length
    ? `I've been building with ${topSkills.join(", ")}`
    : "I've been shipping full-stack work with AI-native tooling";
  const projectLine =
    input.oneLineProject ??
    "[ONE-LINE PROJECT — replace with a real one you shipped]";
  const whyFit = job.isEntryLevel
    ? "the posting is explicit about being open to earlier-career candidates"
    : job.isRemoteAnywhere
      ? "it's fully remote-anywhere, which is what I'm optimizing for"
      : "the stack overlaps closely with what I've been in day-to-day";
  const rateLine =
    job.hourlyMin != null
      ? `I'm targeting $${job.hourlyMin}${job.hourlyMax && job.hourlyMax !== job.hourlyMin ? `–$${job.hourlyMax}` : ""}/hr, which fits your posted range.`
      : "I'm open to $30–50/hr for scope like this — happy to align once we compare details.";

  const portfolio = input.userPortfolio ? `Portfolio: ${input.userPortfolio}` : "";

  return {
    letter: `Hi ${job.company},

I saw the ${job.title} post and wanted to reach out. ${skillsLine} — ${projectLine} — and this looks like a fit because ${whyFit}.

${rateLine} EU + US-East hours, async-friendly.

${portfolio}

Would love to discuss.

Best,
${input.userName}`,
    context: {
      role: job.title,
      company: job.company,
      detectedStack: topSkills,
      rateStated: job.hourlyMin != null,
    },
  };
}

const server = new Server(
  { name: "remote-work-radar", version: "0.0.1" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_jobs",
      description:
        "Search remote-work-radar's aggregated jobs (WWR, RemoteOK, HN 'Who is hiring?'). Returns compact rows with rate, remote flags, skills, and apply URL. Filter by category (ai-ml, frontend, backend, fullstack, devops, data, mobile, lead), free-text query, min hourly, entry-level, or remote-anywhere.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          category: {
            type: "string",
            enum: [
              "ai-ml",
              "frontend",
              "backend",
              "fullstack",
              "devops",
              "data",
              "mobile",
              "lead",
            ],
          },
          minHourly: { type: "number" },
          remoteAnywhere: { type: "boolean" },
          entryLevel: { type: "boolean" },
          hideUsOnly: { type: "boolean", default: true },
          limit: { type: "number", default: 20 },
        },
      },
    },
    {
      name: "get_job",
      description:
        "Fetch one job by id, including the full markdown description and every parsed attribute (timezone offsets, payment method hints, scam reasons, etc.).",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    {
      name: "score_fit",
      description:
        "Heuristic 0–100 fit score for a job against your skills + target hourly. Returns overall, per-dimension breakdown, skill overlap, and detected flags. Not an LLM — deterministic scoring.",
      inputSchema: {
        type: "object",
        properties: {
          jobId: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          targetHourly: { type: "number" },
        },
        required: ["jobId", "skills"],
      },
    },
    {
      name: "draft_cover_letter",
      description:
        "Templated cover letter starter for a specific job, pre-filled with company, role, detected stack, and your rate context. Not an LLM generation — a scaffold you edit.",
      inputSchema: {
        type: "object",
        properties: {
          jobId: { type: "string" },
          userName: { type: "string" },
          userPortfolio: { type: "string" },
          oneLineProject: { type: "string" },
        },
        required: ["jobId", "userName"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  switch (name) {
    case "search_jobs": {
      const input = SearchInput.parse(args ?? {});
      const rows = await searchJobs(input);
      return jsonToolResult(
        rows,
        `Found ${rows.length} jobs. Each row has an 'id' — pass it to get_job / score_fit / draft_cover_letter.`,
      );
    }
    case "get_job": {
      const input = GetJobInput.parse(args ?? {});
      const job = await getJob(input.id);
      if (!job) {
        return jsonToolResult({ error: "not found" }, "No job with that id.");
      }
      return jsonToolResult(job, "Full job detail. Feed to score_fit or draft_cover_letter.");
    }
    case "score_fit": {
      const input = ScoreFitInput.parse(args ?? {});
      const out = await scoreFit(input);
      return jsonToolResult(
        out,
        "Fit score 0–100 with breakdown. Above 70 = worth applying; below 40 = probably skip.",
      );
    }
    case "draft_cover_letter": {
      const input = DraftLetterInput.parse(args ?? {});
      const out = await draftCoverLetter(input);
      return jsonToolResult(out, "Templated cover letter — edit the [PLACEHOLDERS] before sending.");
    }
    default:
      return jsonToolResult({ error: "unknown tool" }, `Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

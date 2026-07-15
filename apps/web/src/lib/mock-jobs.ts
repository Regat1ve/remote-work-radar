/**
 * Mock jobs for the pre-database preview.
 *
 * Once the ETL is running against a real Postgres, /jobs will pull from
 * `packages/db` directly and this file is deleted. Keeping it here so the
 * feed renders with realistic shapes even without a DB — visitors see what
 * the product does before we ask them to run docker-compose.
 */

export type MockJob = {
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

export const MOCK_JOBS: MockJob[] = [
  {
    id: "1",
    title: "Senior Full-Stack Engineer (Next.js + Prisma)",
    company: "Globex Corp",
    postedAt: "2 hours ago",
    hourlyMin: 60,
    hourlyMax: 90,
    isUsOnly: false,
    isRemoteAnywhere: true,
    isEntryLevel: false,
    isScamSuspected: false,
    scamReasons: [],
    regions: ["EU", "Americas"],
    skills: ["nextjs", "prisma", "typescript", "postgres"],
    sources: ["weworkremotely", "remoteok"],
    applyUrl: "https://weworkremotely.com/example-1",
  },
  {
    id: "2",
    title: "Junior Backend Engineer — Node.js",
    company: "Small Batch Software",
    postedAt: "5 hours ago",
    hourlyMin: 22,
    hourlyMax: 35,
    isUsOnly: false,
    isRemoteAnywhere: false,
    isEntryLevel: true,
    isScamSuspected: false,
    scamReasons: [],
    regions: ["EU"],
    skills: ["nodejs", "postgres"],
    sources: ["remoteok"],
    applyUrl: "https://remoteok.com/example-2",
  },
  {
    id: "3",
    title: "AI Engineer — Claude Code Skill Development",
    company: "Anthropic Labs Partner",
    postedAt: "1 day ago",
    hourlyMin: 75,
    hourlyMax: 120,
    isUsOnly: false,
    isRemoteAnywhere: true,
    isEntryLevel: false,
    isScamSuspected: false,
    scamReasons: [],
    regions: ["EU", "Americas", "APAC"],
    skills: ["ai-ml", "claude-code", "typescript"],
    sources: ["hn-who-is-hiring"],
    applyUrl: "https://news.ycombinator.com/item?id=example",
  },
  {
    id: "4",
    title: "Backend Developer (must be US-based)",
    company: "US-only Enterprise Inc.",
    postedAt: "3 hours ago",
    hourlyMin: 55,
    hourlyMax: 85,
    isUsOnly: true,
    isRemoteAnywhere: false,
    isEntryLevel: false,
    isScamSuspected: false,
    scamReasons: [],
    regions: ["US East", "US West"],
    skills: ["python", "aws"],
    sources: ["remoteok"],
    applyUrl: "https://remoteok.com/example-4",
  },
  {
    id: "5",
    title: "Work from home — great income, training fee $200",
    company: "GetRichRemote LLC",
    postedAt: "6 hours ago",
    hourlyMin: null,
    hourlyMax: null,
    isUsOnly: false,
    isRemoteAnywhere: false,
    isEntryLevel: true,
    isScamSuspected: true,
    scamReasons: ["asks for upfront payment", "training fee mentioned"],
    regions: [],
    skills: [],
    sources: ["weworkremotely"],
    applyUrl: "#",
  },
  {
    id: "6",
    title: "Contract Full-Stack Engineer",
    company: "Cursor.dev competitor",
    postedAt: "8 hours ago",
    hourlyMin: 50,
    hourlyMax: 75,
    isUsOnly: false,
    isRemoteAnywhere: true,
    isEntryLevel: false,
    isScamSuspected: false,
    scamReasons: [],
    regions: ["EU", "Americas"],
    skills: ["react", "typescript", "nodejs"],
    sources: ["hn-who-is-hiring"],
    applyUrl: "https://news.ycombinator.com/item?id=example-6",
  },
];

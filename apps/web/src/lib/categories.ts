export type CategoryKey =
  | "ai-ml"
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "data"
  | "mobile"
  | "lead";

export const CATEGORIES: { key: CategoryKey; label: string; keywords: string[] }[] = [
  {
    key: "ai-ml",
    label: "AI / ML",
    keywords: [
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
  },
  {
    key: "frontend",
    label: "Frontend",
    keywords: ["frontend", "front-end", "react", "next.js", "vue", "design engineer", "UI engineer"],
  },
  {
    key: "backend",
    label: "Backend",
    keywords: [
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
  },
  {
    key: "fullstack",
    label: "Fullstack",
    keywords: ["fullstack", "full-stack", "product engineer", "software engineer"],
  },
  {
    key: "devops",
    label: "DevOps / SRE",
    keywords: ["devops", "site reliability", "cloud engineer", "kubernetes engineer"],
  },
  {
    key: "data",
    label: "Data",
    keywords: ["data engineer", "analytics engineer", "ETL"],
  },
  {
    key: "mobile",
    label: "Mobile",
    keywords: ["iOS engineer", "android engineer", "mobile engineer", "react native", "flutter"],
  },
  {
    key: "lead",
    label: "Founding / Lead",
    keywords: [
      "founding",
      "technical lead",
      "tech lead",
      "principal engineer",
      "staff engineer",
      "head of engineering",
    ],
  },
];

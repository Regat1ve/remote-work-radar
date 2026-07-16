import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sources = [
    { slug: "weworkremotely", displayName: "WeWorkRemotely", homepageUrl: "https://weworkremotely.com" },
    { slug: "remoteok", displayName: "RemoteOK", homepageUrl: "https://remoteok.com" },
    {
      slug: "hn-who-is-hiring",
      displayName: 'HN "Who is hiring?"',
      homepageUrl: "https://news.ycombinator.com",
    },
  ];

  for (const s of sources) {
    await prisma.source.upsert({ where: { slug: s.slug }, create: s, update: {} });
  }

  const skills = [
    { slug: "nextjs", displayName: "Next.js" },
    { slug: "react", displayName: "React" },
    { slug: "typescript", displayName: "TypeScript" },
    { slug: "python", displayName: "Python" },
    { slug: "postgres", displayName: "PostgreSQL" },
    { slug: "prisma", displayName: "Prisma" },
    { slug: "nodejs", displayName: "Node.js" },
    { slug: "ai-ml", displayName: "AI / ML" },
    { slug: "claude-code", displayName: "Claude Code" },
    { slug: "aws", displayName: "AWS" },
    { slug: "docker", displayName: "Docker" },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { slug: s.slug },
      create: s,
      update: { displayName: s.displayName },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

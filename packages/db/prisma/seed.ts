import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.source.upsert({
    where: { slug: "weworkremotely" },
    create: {
      slug: "weworkremotely",
      displayName: "WeWorkRemotely",
      homepageUrl: "https://weworkremotely.com",
    },
    update: {},
  });

  await prisma.source.upsert({
    where: { slug: "remoteok" },
    create: {
      slug: "remoteok",
      displayName: "RemoteOK",
      homepageUrl: "https://remoteok.com",
    },
    update: {},
  });

  await prisma.source.upsert({
    where: { slug: "hn-who-is-hiring" },
    create: {
      slug: "hn-who-is-hiring",
      displayName: 'HN "Who is hiring?"',
      homepageUrl: "https://news.ycombinator.com",
    },
    update: {},
  });

  const skills = [
    { slug: "nextjs", displayName: "Next.js", category: "FRAMEWORK" as const },
    { slug: "react", displayName: "React", category: "FRAMEWORK" as const },
    { slug: "typescript", displayName: "TypeScript", category: "LANGUAGE" as const },
    { slug: "python", displayName: "Python", category: "LANGUAGE" as const },
    { slug: "postgres", displayName: "PostgreSQL", category: "DATABASE" as const },
    { slug: "prisma", displayName: "Prisma", category: "FRAMEWORK" as const },
    { slug: "nodejs", displayName: "Node.js", category: "FRAMEWORK" as const },
    { slug: "ai-ml", displayName: "AI / ML", category: "AI_ML" as const },
    { slug: "claude-code", displayName: "Claude Code", category: "AI_ML" as const },
    { slug: "aws", displayName: "AWS", category: "CLOUD" as const },
    { slug: "docker", displayName: "Docker", category: "DEVOPS" as const },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { slug: s.slug },
      create: s,
      update: { displayName: s.displayName, category: s.category },
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

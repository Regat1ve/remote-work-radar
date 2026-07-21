import { prisma } from "@rwr/db";

export async function GET() {
  const users = await prisma.user.count();
  const accounts = await prisma.account.count();
  const sessions = await prisma.session.count();
  const savedJobs = await prisma.savedJob.count();
  const lastUser = await prisma.user.findFirst({ orderBy: { createdAt: "desc" } });
  return Response.json({ counts: { users, accounts, sessions, savedJobs }, lastUser });
}

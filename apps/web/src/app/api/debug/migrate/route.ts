import { prisma } from "@rwr/db";

const DDL = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
  `CREATE TABLE IF NOT EXISTS "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
  )`,
  `CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId")`,
  `CREATE TABLE IF NOT EXISTS "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken")`,
  `CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId")`,
  `CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
  )`,
  `CREATE TABLE IF NOT EXISTS "saved_jobs" (
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("userId","jobId")
  )`,
  `CREATE INDEX IF NOT EXISTS "saved_jobs_jobId_idx" ON "saved_jobs"("jobId")`,
  `DO $$ BEGIN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

export async function POST() {
  const results: Array<{ ok: boolean; sql: string; err?: string }> = [];
  for (const sql of DDL) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push({ ok: true, sql: sql.slice(0, 80) });
    } catch (e) {
      results.push({ ok: false, sql: sql.slice(0, 80), err: (e as Error).message });
    }
  }
  return Response.json({ results });
}

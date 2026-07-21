import { prisma } from "@rwr/db";

export async function ensureErrorLogTable() {
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "debug_error_log" (
       "id" SERIAL PRIMARY KEY,
       "ts" TIMESTAMP NOT NULL DEFAULT NOW(),
       "code" TEXT NOT NULL,
       "payload" TEXT NOT NULL
     )`
  );
}

export async function logError(code: string, payload: unknown) {
  try {
    await ensureErrorLogTable();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "debug_error_log" ("code","payload") VALUES ($1,$2)`,
      code,
      JSON.stringify(payload, (_k, v) => v instanceof Error ? { name: v.name, message: v.message, stack: v.stack, cause: (v as { cause?: unknown }).cause } : v).slice(0, 8000)
    );
  } catch {
    // swallow, we're diagnosing
  }
}

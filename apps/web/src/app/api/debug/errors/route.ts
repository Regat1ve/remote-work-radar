import { prisma } from "@rwr/db";
import { ensureErrorLogTable } from "@/lib/error-log";

export async function GET() {
  await ensureErrorLogTable();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, ts, code, payload FROM "debug_error_log" ORDER BY id DESC LIMIT 20`
  );
  return Response.json(rows);
}

export async function DELETE() {
  await prisma.$executeRawUnsafe(`DELETE FROM "debug_error_log"`);
  return Response.json({ cleared: true });
}

import { prisma } from "@rwr/db";

export async function GET() {
  const allTables = await prisma.$queryRawUnsafe(
    `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name`
  );
  const cols = await prisma.$queryRawUnsafe(
    `SELECT table_schema, table_name, column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema NOT IN ('pg_catalog','information_schema')
       AND table_name IN ('users','accounts','sessions','verification_tokens','saved_jobs','User','Account','Session','VerificationToken','SavedJob')
     ORDER BY table_schema, table_name, ordinal_position`
  );
  const constraints = await prisma.$queryRawUnsafe(
    `SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema)
     WHERE tc.table_name IN ('users','accounts','sessions','verification_tokens','saved_jobs','User','Account','Session','VerificationToken','SavedJob')
       AND tc.constraint_type IN ('PRIMARY KEY','UNIQUE')
     ORDER BY tc.table_schema, tc.table_name, tc.constraint_type`
  );
  return Response.json({ allTables, cols, constraints });
}

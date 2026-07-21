import { prisma } from "@rwr/db";

export async function GET() {
  const cols = await prisma.$queryRawUnsafe<Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>>(
    `SELECT table_name, column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name IN ('users','accounts','sessions','verification_tokens','saved_jobs')
     ORDER BY table_name, ordinal_position`
  );
  const constraints = await prisma.$queryRawUnsafe<Array<{ table_name: string; constraint_name: string; constraint_type: string; column_name: string }>>(
    `SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema)
     WHERE tc.table_name IN ('users','accounts','sessions','verification_tokens','saved_jobs')
       AND tc.constraint_type IN ('PRIMARY KEY','UNIQUE')
     ORDER BY tc.table_name, tc.constraint_type`
  );
  return Response.json({ cols, constraints });
}

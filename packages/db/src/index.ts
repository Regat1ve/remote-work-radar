import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __rwr_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__rwr_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__rwr_prisma__ = prisma;
}

export * from "@prisma/client";

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@rwr/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: "database" },
  pages: { signIn: "/signin" },
  debug: true,
  logger: {
    error(code, ...rest) {
      console.error("[auth-error]", code, JSON.stringify(rest, (_k, v) => v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : v));
    },
    warn(code, ...rest) { console.warn("[auth-warn]", code, ...rest); },
  },
});

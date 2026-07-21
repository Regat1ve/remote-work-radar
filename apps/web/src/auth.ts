import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@rwr/db";
import { logError } from "@/lib/error-log";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub({ checks: ["state"] })],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[cb-signIn]", JSON.stringify({ user, provider: account?.provider, profileLogin: (profile as { login?: string } | undefined)?.login }));
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) (session.user as { id?: string }).id = token.uid as string;
      return session;
    },
  },
  events: {
    async signIn(msg) { console.log("[event-signIn]", JSON.stringify({ userId: msg.user.id, provider: msg.account?.provider, isNewUser: msg.isNewUser })); },
    async linkAccount(msg) { console.log("[event-linkAccount]", JSON.stringify({ userId: msg.user.id, provider: msg.account.provider })); },
    async createUser(msg) { console.log("[event-createUser]", JSON.stringify({ id: msg.user.id, email: msg.user.email })); },
  },
  debug: true,
  logger: {
    error(code, ...rest) {
      console.error("[auth-error]", code, JSON.stringify(rest, (_k, v) => v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : v));
      void logError(String(code), rest);
    },
    warn(code, ...rest) { console.warn("[auth-warn]", code, ...rest); },
  },
});

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Only persists users/accounts when a real database is configured — without
  // it, Google sign-in still works purely via JWT (no seeding, no persistence),
  // which keeps the zero-config demo path alive for anyone cloning this repo.
  adapter: isDatabaseConfigured() ? PrismaAdapter(getPrisma()) : undefined,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

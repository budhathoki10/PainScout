import NextAuth from "next-auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // No adapter — Google sign-in just upserts the User row by email on every
    // token refresh. Simple, no Account-linking table, so there's no
    // "OAuthAccountNotLinked" failure mode. Falls back to a pure-JWT session
    // (no persistence) when no DATABASE_URL is set, keeping the demo path alive.
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email && isDatabaseConfigured()) {
        const prisma = getPrisma();
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: user?.name ?? undefined,
            image: user?.image ?? undefined,
          },
          create: {
            email,
            name: user?.name,
            image: user?.image,
          },
        });
        token.id = dbUser.id;
      }
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

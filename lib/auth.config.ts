import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible slice of the auth config — no Prisma import here.
 * middleware.ts builds its own NextAuth instance from just this file so the
 * Edge Middleware bundle never has to load Prisma's native/WASM engine.
 * lib/auth.ts extends this with the DB-backed jwt callback for the full
 * Node runtime.
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/saved",
  "/analytics",
  "/billing",
  "/account",
  "/onboarding",
];

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = PROTECTED_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      return true;
    },
  },
};

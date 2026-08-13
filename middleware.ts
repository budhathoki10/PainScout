import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Built from the Prisma-free config slice — see lib/auth.config.ts for why.
const { auth } = NextAuth(authConfig);

export function middleware(...args: Parameters<typeof auth>) {
  return auth(...args);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/saved/:path*",
    "/analytics/:path*",
    "/billing/:path*",
    "/account/:path*",
    "/onboarding/:path*",
  ],
};

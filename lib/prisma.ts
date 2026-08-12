import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Lazily-created Prisma client. Only instantiated on first real use, so the
 * demo build (which reads from lib/mock-data.ts instead) never needs a live
 * DATABASE_URL to boot. Once DATABASE_URL is set, every call site in
 * lib/data/* and the cron pipeline works against the real database.
 */
export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add a MongoDB connection string to .env to enable live data (see README).",
    );
  }
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  return global.__prisma;
}

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

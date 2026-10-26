import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

/** Cloudflare D1 HTTP API credentials from .env, or null when D1 is not configured. */
export function d1Config() {
  const e = process.env;
  const CLOUDFLARE_ACCOUNT_ID = e.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_D1_TOKEN = e.CLOUDFLARE_D1_TOKEN || e.CLOUDFLARE_API_TOKEN;
  const CLOUDFLARE_DATABASE_ID = e.CLOUDFLARE_DATABASE_ID || e.D1_DATABASE_ID;
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_D1_TOKEN || !CLOUDFLARE_DATABASE_ID) return null;
  return { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_TOKEN, CLOUDFLARE_DATABASE_ID };
}

// D1 when its credentials are set, otherwise the local SQLite file in DATABASE_URL.
export function createClient() {
  const d1 = d1Config();
  return d1 ? new PrismaClient({ adapter: new PrismaD1(d1) }) : new PrismaClient();
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;

import { getCloudflareContext } from "@opennextjs/cloudflare";
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

/** The Worker's request context when running on Cloudflare, otherwise null (next dev, scripts). */
function workerContext() {
  try {
    return getCloudflareContext();
  } catch {
    return null;
  }
}

// On Workers a client must not be shared between requests, so keep one per request context.
const perRequest = new WeakMap<object, PrismaClient>();
const g = globalThis as unknown as { prisma?: PrismaClient };

function client(): PrismaClient {
  const cf = workerContext();
  if (cf) {
    let c = perRequest.get(cf.ctx);
    if (!c) {
      c = new PrismaClient({ adapter: new PrismaD1(cf.env.DB) });
      perRequest.set(cf.ctx, c);
    }
    return c;
  }
  g.prisma ??= createClient();
  return g.prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const c = client();
    const value = Reflect.get(c, prop);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

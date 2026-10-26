// Applies prisma/d1/*.sql to the Cloudflare D1 database over its HTTP API, once each.
// Regenerate the SQL after a schema change with `npm run d1:diff` (see README).
//
//   npm run d1:migrate
import fs from "node:fs";
import path from "node:path";
import { d1Config } from "../src/lib/db";

const d1 = d1Config();
const DIR = path.join(process.cwd(), "prisma", "d1");

type D1Response = { success: boolean; errors: { message: string }[]; result: { results: Record<string, unknown>[] }[] };

async function query(sql: string, params: unknown[] = []) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${d1!.CLOUDFLARE_ACCOUNT_ID}/d1/database/${d1!.CLOUDFLARE_DATABASE_ID}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${d1!.CLOUDFLARE_D1_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params }),
  });
  const json = (await res.json()) as D1Response;
  if (!json.success) throw new Error(json.errors.map((e) => e.message).join("; ") || `D1 HTTP ${res.status}`);
  return json.result[0]?.results ?? [];
}

async function main() {
  if (!d1) throw new Error("Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN and D1_DATABASE_ID in .env");
  await query(`CREATE TABLE IF NOT EXISTS "_d1_migrations" ("name" TEXT NOT NULL PRIMARY KEY, "appliedAt" TEXT NOT NULL)`);
  const applied = new Set((await query(`SELECT "name" FROM "_d1_migrations"`)).map((r) => String(r.name)));
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const statements = fs
      .readFileSync(path.join(DIR, file), "utf8")
      .replace(/^--.*$/gm, "")
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`Applying ${file} (${statements.length} statements)`);
    for (const sql of statements) await query(sql);
    await query(`INSERT INTO "_d1_migrations" ("name", "appliedAt") VALUES (?, ?)`, [file, new Date().toISOString()]);
  }
  console.log("D1 schema is up to date.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});

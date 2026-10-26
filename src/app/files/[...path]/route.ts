import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/storage";

// Serves files uploaded without R2 (plain Node only); on Workers uploads live in R2 and this returns 404.

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  if (parts.some((p) => p.startsWith("."))) return new Response("Not found", { status: 404 });
  const full = path.resolve(UPLOAD_ROOT, ...parts);
  if (!full.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });
  try {
    // Resolve symlinks so a link inside the uploads dir can't point outside it.
    const [real, rootReal] = await Promise.all([fs.realpath(full), fs.realpath(UPLOAD_ROOT)]);
    if (!real.startsWith(rootReal + path.sep)) return new Response("Not found", { status: 404 });
    const data = await fs.readFile(real);
    const ext = path.extname(full).toLowerCase();
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

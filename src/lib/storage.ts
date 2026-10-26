import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { r2Delete, r2Enabled, r2KeyFromUrl, r2Put } from "./r2";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const PDF_TYPES: Record<string, string> = { "application/pdf": ".pdf" };

export type UploadKind = "image" | "pdf";

export class UploadError extends Error {}

export async function saveUpload(file: File, kind: UploadKind, folder: string) {
  const allowed = kind === "image" ? IMAGE_TYPES : PDF_TYPES;
  const limit = kind === "image" ? 12 * 1024 * 1024 : 25 * 1024 * 1024;
  const ext = allowed[file.type];
  if (!ext) throw new UploadError(kind === "image" ? "Only JPG, PNG, WebP or GIF images are allowed." : "Only PDF files are allowed.");
  if (file.size > limit) throw new UploadError(`File is too large (max ${Math.round(limit / 1024 / 1024)} MB).`);

  const bytes = Buffer.from(await file.arrayBuffer());
  // Cheap magic-byte check so a renamed file cannot slip through.
  const head = bytes.subarray(0, 4).toString("hex");
  const okMagic =
    (kind === "pdf" && bytes.subarray(0, 4).toString() === "%PDF") ||
    (kind === "image" && (head.startsWith("ffd8ff") || head === "89504e47" || head === "52494646" || head.startsWith("47494638")));
  if (!okMagic) throw new UploadError("File content does not match its type.");

  const name = `${randomUUID()}${ext}`;
  if (r2Enabled) return { url: await r2Put(`${folder}/${name}`, bytes, file.type), size: bytes.length };
  // No R2 credentials (local dev): keep files on disk, served by /files/*.
  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return { url: `/files/${folder}/${name}`, size: bytes.length };
}

export async function deleteUpload(url: string | null | undefined) {
  if (!url) return;
  const key = r2Enabled ? r2KeyFromUrl(url) : null;
  if (key) return r2Delete(key);
  if (!url.startsWith("/files/")) return;
  const rel = url.replace("/files/", "");
  const full = path.resolve(UPLOAD_ROOT, rel);
  if (!full.startsWith(UPLOAD_ROOT + path.sep)) return;
  await fs.rm(full, { force: true });
}

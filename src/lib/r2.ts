import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 through its S3-compatible API. Shared by the app and the migration scripts,
// so it must not import "server-only".
const env = process.env;
const BUCKET = env.R2_BUCKET || env.R2_BUCKET_NAME;
const ACCOUNT = env.R2_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
const ENDPOINT = env.R2_ENDPOINT || (ACCOUNT ? `https://${ACCOUNT}.r2.cloudflarestorage.com` : "");

/** Public base URL of the bucket: a custom CDN domain or its pub-….r2.dev address. */
export const R2_PUBLIC_URL = (env.R2_PUBLIC_URL || env.R2_PUBLIC_ENDPOINT || "").replace(/\/+$/, "");

export const r2Enabled = Boolean(env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && BUCKET && ENDPOINT && R2_PUBLIC_URL);

let client: S3Client | null = null;
function s3() {
  if (!r2Enabled) throw new Error("R2 is not configured (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL).");
  client ??= new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
  });
  return client;
}

export const r2Url = (key: string) => `${R2_PUBLIC_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;

/** Object key for a URL that lives in our bucket, otherwise null. */
export function r2KeyFromUrl(url: string) {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL + "/")) return null;
  return decodeURIComponent(url.slice(R2_PUBLIC_URL.length + 1));
}

export async function r2Put(key: string, body: Uint8Array, contentType: string) {
  await s3().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }),
  );
  return r2Url(key);
}

export async function r2Exists(key: string) {
  try {
    await s3().send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function r2Delete(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

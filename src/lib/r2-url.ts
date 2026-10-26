// Public URLs of objects in the R2 bucket, shared by the S3 client (./r2) and the Workers binding path (./storage).
const env = process.env;

/** Public base URL of the bucket: a custom CDN domain or its pub-….r2.dev address. */
export const R2_PUBLIC_URL = (env.R2_PUBLIC_URL || env.R2_PUBLIC_ENDPOINT || "").replace(/\/+$/, "");

export const r2Url = (key: string) => `${R2_PUBLIC_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;

/** Object key for a URL that lives in our bucket, otherwise null. */
export function r2KeyFromUrl(url: string) {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL + "/")) return null;
  return decodeURIComponent(url.slice(R2_PUBLIC_URL.length + 1));
}

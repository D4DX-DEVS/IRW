import { clsx, type ClassValue } from "clsx";

export const cn = (...i: ClassValue[]) => clsx(i);

export function slugify(s: string) {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9ഀ-ൿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "post";
}

export function fmtDate(d: Date | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", opts ?? { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function fmtBytes(n: number) {
  if (!n) return "—";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(d: Date) {
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const POST_TYPES = {
  NEWS: "News",
  EVENT: "Event",
  ACHIEVEMENT: "Achievement",
  REPORT: "Rescue report",
} as const;

export const TEAM_GROUPS = {
  LEADERS: "Leaders",
  GOVERNING: "Governing body",
  DISTRICT: "District coordinators",
  MEDICAL: "Medical wing",
} as const;

export const TOPICS = {
  VOLUNTEER: "Volunteer registration",
  DONATION: "Donation",
  EMERGENCY: "Emergency",
  GENERAL: "General enquiry",
} as const;

export const DISTRICTS = [
  "Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha","Kottayam","Idukki","Ernakulam",
  "Thrissur","Palakkad","Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod","Outside Kerala",
];

export function pageParam(v: string | string[] | undefined) {
  const n = parseInt(Array.isArray(v) ? v[0] : v ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
export function strParam(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

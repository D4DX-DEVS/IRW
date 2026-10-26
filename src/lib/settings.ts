import { db } from "./db";

export const DEFAULT_SETTINGS = {
  orgName: "Ideal Relief Wing Kerala",
  tagline: "Disaster management volunteer corps",
  founded: "1992",
  about:
    "IRW is a registered NGO established in 1992 with a vision to serve the society by providing trained volunteer services in dire situations of natural catastrophes i.e earth quakes, floods, accidents, landslides, epidemics and other social disturbances like riots, among others.",
  address: "Santhinikethan Campus, Kurikkal Bazar, Parappur P.O, Kottakkal – 676503, Malappuram Dist., Kerala, India",
  phone1: "+91 82817 47450",
  phone2: "+91 82817 47452",
  phone3: "+91 82817 47460",
  email: "idealreliefwing@gmail.com",
  whatsapp: "918281747450",
  facebook: "https://www.facebook.com/people/IRW-Kerala/100063821060969/",
  youtube: "https://www.youtube.com/@IRWKerala",
  mapEmbed: "",
  logoUrl: "",
  logoWhiteUrl: "",
  faviconUrl: "",
};
export type Settings = typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out as Settings;
}

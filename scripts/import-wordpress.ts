// One-off migration from the old WordPress site (https://www.irwkerala.org) into the database
// (D1 when CLOUDFLARE_* is set) and the R2 bucket. Safe to re-run: files already in R2 are
// skipped and rows are matched by slug / name / URL instead of being duplicated.
//
//   npm run wp:import
import { createClient } from "../src/lib/db";
import { r2Enabled, r2Exists, r2Put, r2Url } from "../src/lib/r2";
import { slugify } from "../src/lib/utils";

const SITE = "https://www.irwkerala.org";
const UPLOADS = `${SITE}/wp-content/uploads/`;
const db = createClient();

type WpPost = { id: number; date_gmt: string; slug: string; title: { rendered: string }; content: { rendered: string }; excerpt: { rendered: string }; featured_media: number };
type WpMedia = { id: number; post: number | null; source_url: string; mime_type: string; title: { rendered: string }; alt_text: string; date_gmt: string };

// Posts the old site hard-coded on the "Articles" page rather than publishing as WordPress posts.
const ACHIEVEMENTS = [
  {
    slug: "golden-salute-award",
    cover: "2022/09/Golden-Salute.jpg",
    title: "‘ഗോൾഡൻ സല്യൂട്ട്’ ഐ.ആർ.ഡബ്ല്യുവിന്",
    excerpt: "COVID-19 സേവനത്തിന് മലബാർ ഗോൾഡ് ആന്റ് ഡയമണ്ട്‌സും മനോരമ ഓൺലൈനും ചേർന്ന് നൽകിയ GOLDEN SALUTE AWARD.",
    body: "‘ഗോൾഡൻ സല്യൂട്ട്’ ഐ.ആർ.ഡബ്ല്യുവിന് സാമൂഹീക പ്രതിബദ്ധതയിലൂന്നിയ ജീവിതശൈലിയുടെ ഭാഗമായി ഐ.ആർ.ഡബ്ല്യു വളണ്ടിയർമാർ കോവിഡ് 19 എന്ന മഹാമാരിക്ക് മുമ്പിൽ സധീരം സൂക്ഷ്മമായി നിലകൊള്ളുകയാണ്. ഓരോ കോവിഡ് രോഗിയുടെയും ആശ്രിതരെല്ലാം അശരണരായപ്പോൾ അഭയകേന്ദ്രമായി മാറുകയായിരുന്നു ഐ.ആർ.ഡബ്ല്യു.\n\nകോവിഡ്കാല സേവനം മുൻനിർത്തി മലബാർ ഗോൾഡ് ആന്റ് ഡയമണ്ട്‌സും മനോരമ ഓൺലൈനും ചേർന്ന് നടത്തിയ ജനകീയ വോട്ടെടുപ്പിൽ ഗ്രൂപ്പ് ഇനത്തിൽ GOLDEN SALUTE AWARD’ന് തെരഞ്ഞെടുത്തു.",
    tags: "Award,COVID-19",
    featured: true,
    publishedAt: "2021-02-17T10:00:00Z",
  },
  {
    slug: "pettimudi-honour",
    cover: "2022/11/Moonnar-Adaram.jpg",
    title: "പെട്ടിമുടി ദുരന്തമേഖലയിലെ സേവനത്തിന് ഐഡിയൽ റിലീഫ് വിങിന് ആദരം",
    excerpt: "മൂന്നാർ സി.പി.ഐ ആസ്ഥാനത്ത് നടന്ന ചടങ്ങിൽ ഭാരവാഹികൾ ആദരം ഏറ്റുവാങ്ങി.",
    body: "ഇടുക്കി : മൂന്നാർ പെട്ടിമുടി ദുരന്തമേഖലയിൽ സേവന നിരതരായിരുന്ന ഐഡിയൽ റിലീഫ് വിങിന് വേണ്ടി, മൂന്നാർ സി.പി.ഐ ആസ്ഥാനത്ത് നടന്ന ചടങ്ങിൽ വെച്ച് ഭാരവാഹികൾ ആദരം ഏറ്റുവാങ്ങുന്നു.",
    tags: "Honour,Munnar",
    featured: false,
    publishedAt: "2020-10-14T10:00:00Z",
  },
  {
    slug: "poonoor-river-search",
    cover: "2022/09/article-1.jpg",
    title: "പൂനൂർ പുഴയിൽ കാണാതായ സഹോദരിയെ കണ്ടെത്താൻ ഐ.ആർ.ഡബ്ല്യു വളണ്ടിയേഴ്‌സ്",
    excerpt: "വാർഡ് മെമ്പർ ഫാത്തിമ ജസ്‌ലിന്റെ നന്ദി കുറിപ്പ്.",
    body: "കുന്ദമംഗലം പന്തീർപ്പാടം പൂനൂർ പുഴയിൽ പതിനൊന്നു ദിവസമായി റുക്കിയ (54) എന്നവരെ കാണാതായിട്ട്, നാട്ടുകാരും പോലീസും ഫയർഫോഴ്‌സും എല്ലാവിധത്തിലും അന്വേഷണം നടത്തിയിട്ടും കണ്ടെത്താനായിരുന്നില്ല. ഐ.ആർ.ഡബ്ല്യു ടീം മൂന്നു ബോട്ടുകളും മുഴുവൻ ഫോഴ്‌സും ഉപയോഗപ്പെടുത്തി രാവിലെ 7 മണിക്ക് പുനൂർ പുഴയിൽ തിരച്ചിൽ ആരംഭിച്ചു. ഏതാണ്ട് 10 മണിയോടെ പാറക്കടവ് പാലത്തിനോട് അടുത്തുള്ള കടവിൽ വച്ചു മൃതദേഹം കണ്ടെത്തി.\n\n— ഫാത്തിമ ജസ്‌ലിൻ, വാർഡ് മെമ്പർ, കുന്ദമംഗലം ഗ്രാമപഞ്ചായത്ത്.",
    tags: "Search,Kozhikode",
    featured: false,
    publishedAt: "2021-12-01T10:00:00Z",
  },
];

// Old /our-team page, in page order.
const TEAM = [
  ["Basheer Sharqi", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.57_6a967d9a.jpg"],
  ["Shameer V.I", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.58_a7bc4275.jpg"],
  ["Asif Ali P.K", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.58_15fa53c4.jpg"],
  ["Sharafudheen P", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.58_97a7b772.jpg"],
  ["Muhammed Ashraf P", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.59_741124aa.jpg"],
  ["Shajeer K", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.59_dd9c1a1d.jpg"],
  ["Shajeel Bin Hassan", "2025/08/WhatsApp-Image-2025-08-16-at-11.15.59_aa489ce2.jpg"],
  ["Fazuludheen M", "2025/08/WhatsApp-Image-2025-08-16-at-11.16.00_8a13cf25.jpg"],
] as const;

const PUBLICATIONS = [
  { title: "Annual Report 2020", year: 2020, file: "2025/09/IRW_new_report_2020-compressed.pdf" },
  { title: "Annual Report 2020 – 2021", year: 2021, file: "2025/08/IRW-Kerala-Report-2020-2021-for-IT-Dept.pdf" },
  { title: "Annual Report 2019 – 2020", year: 2020, file: "2025/08/IRW-Kerala-Report-2019-2020-for-IT-Dept.pdf" },
];

const BANNERS = ["2025/09/banner1.jpg", "2025/09/banner2.jpg"];
const BANNER_TEXT = [
  {
    title: "Trained hands when disaster strikes",
    subtitle: "Volunteer rescuers, medics and para-medics serving Kerala since 1992 — from the first search to the last rebuilt home.",
    ctaLabel: "Support our work",
    ctaHref: "/contact-us?topic=DONATION",
  },
  {
    title: "Ready at any hour, anywhere in Kerala",
    subtitle: "Boat, water and debris search teams for floods, landslides and accidents. Call +91 82817 47450.",
    ctaLabel: "Become a volunteer",
    ctaHref: "/contact-us?topic=VOLUNTEER",
  },
];

// Stand-alone photos from the old home, /images and /video pages.
const GALLERY = [
  "2022/09/GALLERY-1.jpg",
  "2022/09/GALLERY-1-2.jpg",
  "2022/09/Gallery-1-3.jpg",
  "2022/09/GALLERY-1-4.jpg",
  "2022/09/GALLERY-2.jpg",
  "2022/09/GALLERY-2-1.jpg",
  "2022/10/GALLERY-3-3.jpg",
  "2022/09/GALLERY-4.jpg",
  "2022/09/Gallery-7.jpg",
  "2022/09/Kalamassery-18-03-2022.jpg",
  "2022/11/About-2.jpg",
  "2024/07/new-HELP-desk-scaled.jpg",
  "2024/08/IRW-1.jpg",
  "2024/08/IRW-8.jpg",
  "2024/08/IRW-11.jpg",
  "2025/08/WhatsApp-Image-2025-08-18-at-14.56.42_fc8c83c7.jpg",
];

const BRAND = { logoUrl: "2024/08/logo2.png", logoWhiteUrl: "2022/05/logo-white2.png", faviconUrl: "2022/05/logo.png" };

// ---------------------------------------------------------------------------

async function getJson<T>(url: string): Promise<{ data: T; totalPages: number }> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "irw-migration/1.0" } });
    if (res.ok) return { data: (await res.json()) as T, totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1) };
    if (attempt >= 3) throw new Error(`GET ${url} → ${res.status}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

async function getAll<T>(endpoint: string, fields: string) {
  const out: T[] = [];
  for (let page = 1, total = 1; page <= total; page++) {
    const r = await getJson<T[]>(`${SITE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_fields=${fields}`);
    out.push(...r.data);
    total = r.totalPages;
  }
  return out;
}

// The old host drops connections now and then, so retry a few times.
async function download(url: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "irw-migration/1.0" } });
      if (!res.ok) throw new Error(`download ${url} → ${res.status}`);
      return { bytes: new Uint8Array(await res.arrayBuffer()), type: res.headers.get("content-type") ?? "application/octet-stream" };
    } catch (e) {
      if (attempt >= 4) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

const mirrored = new Map<string, string>();
let uploadedCount = 0;

/** Copy a wp-content/uploads file into R2 under wp/<yyyy>/<mm>/<name>; returns its CDN URL. */
async function mirror(src: string) {
  const rel = src.startsWith("http") ? decodeURI(src.replace(/^https?:\/\/(www\.)?irwkerala\.org\/wp-content\/uploads\//, "")) : src;
  const hit = mirrored.get(rel);
  if (hit) return hit;
  const key = `wp/${rel}`;
  let url = r2Url(key);
  if (!(await r2Exists(key))) {
    const { bytes, type } = await download(UPLOADS + rel.split("/").map(encodeURIComponent).join("/"));
    url = await r2Put(key, bytes, type);
    uploadedCount++;
    console.log(`  ↑ ${key}`);
  }
  mirrored.set(rel, url);
  return url;
}

async function tryMirror(src: string) {
  try {
    return await mirror(src);
  } catch (e) {
    console.warn(`  ! skipped ${src}: ${(e as Error).message}`);
    return null;
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m),
  );

/** WordPress HTML → the site's plain-text body format (blank line = paragraph, "## " heading, "> " quote). */
function htmlToBody(html: string) {
  const text = html
    .replace(/<(script|style|figure|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, t) => `\n\n## ${t}\n\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t: string) => `\n\n${t.replace(/<[^>]+>/g, " ").trim().split(/\n+/).map((l) => `> ${l.trim()}`).join("\n")}\n\n`)
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|ul|ol)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decode(text)
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const plain = (html: string) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const isImage = (m: WpMedia) => m.mime_type.startsWith("image/");

// ---------------------------------------------------------------------------

async function importBrand() {
  console.log("Brand assets");
  for (const [key, rel] of Object.entries(BRAND)) {
    const value = await mirror(rel);
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}

async function importPosts(media: Map<number, WpMedia>, byParent: Map<number, WpMedia[]>) {
  console.log("Posts");
  const posts = await getAll<WpPost>("posts", "id,date_gmt,slug,title,content,excerpt,featured_media");
  let albumSort = await db.album.count();
  for (const p of posts) {
    const title = plain(p.title.rendered);
    // The rescue-report post was already published here under an English slug.
    const slug = p.id === 2895 ? "mundakkai-chooralmala-rescue-report" : slugify(decodeURIComponent(p.slug)) || `post-${p.id}`;
    const featured = media.get(p.featured_media);
    const coverUrl = featured ? await tryMirror(featured.source_url) : null;
    let body = htmlToBody(p.content.rendered);
    // Files linked from the text (videos, PDFs, images) move to R2 too.
    for (const link of new Set(body.match(/https?:\/\/(www\.)?irwkerala\.org\/wp-content\/uploads\/[^\s"'<>)]+/g) ?? [])) {
      const url = await tryMirror(link);
      if (url) body = body.replaceAll(link, url);
    }
    const excerpt = (plain(p.excerpt.rendered) || body.replace(/\s+/g, " ")).replace(/\s*\[…\]$/, "").slice(0, 280);
    const data = { type: "NEWS", title, excerpt, body, coverUrl, status: "PUBLISHED", publishedAt: new Date(`${p.date_gmt}Z`), authorName: "IRW Kerala" };
    await db.post.upsert({ where: { slug }, update: data, create: { ...data, slug, featured: p.id === 2895 } });
    console.log(`  • ${title.slice(0, 70)}`);

    // Every image attached to the post becomes a gallery album named after it.
    const images = (byParent.get(p.id) ?? []).filter(isImage);
    if (images.length < 2) continue;
    const albumSlug = `wp-${p.id}`;
    const album =
      (await db.album.findUnique({ where: { slug: albumSlug } })) ??
      (await db.album.create({ data: { name: title.slice(0, 80), slug: albumSlug, sort: albumSort++ } }));
    await addPhotos(album.id, images.map((m) => ({ src: m.source_url, caption: plain(m.alt_text || m.title.rendered) })));
  }
}

async function addPhotos(albumId: string, items: { src: string; caption: string }[]) {
  const existing = new Set((await db.photo.findMany({ where: { albumId }, select: { url: true } })).map((x) => x.url));
  let sort = existing.size;
  for (const it of items) {
    const url = await tryMirror(it.src);
    if (!url || existing.has(url)) continue;
    await db.photo.create({ data: { albumId, url, caption: it.caption.slice(0, 120), sort: sort++ } });
    existing.add(url);
  }
}

async function importAchievements() {
  console.log("Achievements");
  for (const { cover, publishedAt, ...a } of ACHIEVEMENTS) {
    const coverUrl = await mirror(cover);
    await db.post.upsert({
      where: { slug: a.slug },
      update: { coverUrl },
      create: { ...a, type: "ACHIEVEMENT", coverUrl, status: "PUBLISHED", publishedAt: new Date(publishedAt), authorName: "IRW Kerala" },
    });
  }
}

async function importGallery() {
  console.log("Gallery");
  const album =
    (await db.album.findUnique({ where: { slug: "gallery" } })) ?? (await db.album.create({ data: { name: "Gallery", slug: "gallery", sort: 0 } }));
  await addPhotos(album.id, GALLERY.map((src) => ({ src, caption: "" })));

  // Drop the placeholder albums created by `npm run db:seed`.
  const placeholders = await db.album.findMany({ where: { photos: { some: { url: { startsWith: "/files/seed/" } } } }, include: { photos: true } });
  for (const a of placeholders) {
    if (a.photos.every((ph) => ph.url.startsWith("/files/seed/"))) await db.album.delete({ where: { id: a.id } });
  }
}

async function importTeam() {
  console.log("Team");
  for (const [i, [name, photo]] of TEAM.entries()) {
    const photoUrl = await mirror(photo);
    const found = await db.teamMember.findFirst({ where: { name } });
    if (found) await db.teamMember.update({ where: { id: found.id }, data: { photoUrl } });
    else await db.teamMember.create({ data: { name, designation: "Governing Body Member", groupName: "GOVERNING", photoUrl, sort: i } });
  }
}

async function importPublications() {
  console.log("Publications");
  for (const p of PUBLICATIONS) {
    const fileUrl = await mirror(p.file);
    const head = await fetch(fileUrl, { method: "HEAD" }).catch(() => null);
    const sizeBytes = Number(head?.headers.get("content-length") ?? 0);
    const found = await db.publication.findFirst({ where: { OR: [{ fileUrl: UPLOADS + p.file }, { fileUrl }, { title: p.title }] } });
    if (found) await db.publication.update({ where: { id: found.id }, data: { fileUrl, ...(sizeBytes ? { sizeBytes } : {}) } });
    else await db.publication.create({ data: { title: p.title, category: "ANNUAL", year: p.year, fileUrl, sizeBytes } });
  }
}

async function importBanners() {
  console.log("Banners");
  for (const [i, rel] of BANNERS.entries()) {
    const imageUrl = await mirror(rel);
    if (await db.banner.findFirst({ where: { imageUrl } })) continue;
    await db.banner.create({ data: { ...BANNER_TEXT[i], imageUrl, sort: i } });
  }
}

async function main() {
  if (!r2Enabled) throw new Error("Set the R2_* variables in .env before importing — files are copied to the R2 bucket.");
  console.log("Reading the WordPress media library…");
  const all = await getAll<WpMedia>("media", "id,post,source_url,mime_type,title,alt_text,date_gmt");
  const media = new Map(all.map((m) => [m.id, m]));
  const byParent = new Map<number, WpMedia[]>();
  for (const m of all) if (m.post) byParent.set(m.post, [...(byParent.get(m.post) ?? []), m]);
  console.log(`  ${all.length} media items`);

  await importBrand();
  await importPosts(media, byParent);
  await importAchievements();
  await importGallery();
  await importTeam();
  await importPublications();
  await importBanners();
  await db.activity.create({ data: { actor: "System", verb: "imported content from the old WordPress site", kind: "info" } });
  console.log(`Done. ${uploadedCount} new file(s) uploaded to R2.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

import { createClient } from "../src/lib/db";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const db = createClient();
const UPLOADS = path.join(process.cwd(), "uploads");

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@irwkerala.org";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
// Only overwrite an existing admin's password when it was set explicitly in the env.
const RESET_PASSWORD = !!process.env.SEED_ADMIN_PASSWORD;

const tones = ["#294d8c", "#4976b3", "#a3142a", "#172e63", "#699bdf"];
function sampleSvg(label: string, i: number) {
  const a = tones[i % tones.length];
  const b = tones[(i + 2) % tones.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="60" y="730" font-family="Arial" font-size="40" fill="rgba(255,255,255,.85)">${label}</text></svg>`;
}

async function main() {
  fs.mkdirSync(path.join(UPLOADS, "seed"), { recursive: true });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: RESET_PASSWORD ? { passwordHash } : {},
    create: { email: ADMIN_EMAIL, name: "Site Admin", role: "SUPER_ADMIN", passwordHash },
  });

  if ((await db.post.count()) === 0) {
    const posts = [
      {
        type: "NEWS",
        title: "മുണ്ടക്കൈ – ചൂരൽമല ഉരുൾ ദുരന്തം IRW റെസ്ക്യൂ റിപ്പോർട്ട് മാധ്യമം എഡിറ്റർ പി ഐ നൗഷാദ് പ്രകാശനം ചെയ്തു",
        slug: "mundakkai-chooralmala-rescue-report",
        excerpt: "Release of the IRW rescue report on the Mundakkai–Chooralmala landslide.",
        body: "മുണ്ടക്കൈ – ചൂരൽമല ഉരുൾ ദുരന്തത്തിലെ IRW റെസ്ക്യൂ റിപ്പോർട്ട് മാധ്യമം എഡിറ്റർ പി ഐ നൗഷാദ് പ്രകാശനം ചെയ്തു.\n\n[Replace this sample text with the full article from the admin editor.]",
        tags: "Wayanad,Landslide,Report",
        featured: true,
        publishedAt: new Date("2025-09-19T10:00:00Z"),
      },
      {
        type: "ACHIEVEMENT",
        title: "‘ഗോൾഡൻ സല്യൂട്ട്’ ഐ.ആർ.ഡബ്ല്യുവിന്",
        slug: "golden-salute-award",
        excerpt: "COVID-19 സേവനത്തിന് മലബാർ ഗോൾഡ് ആന്റ് ഡയമണ്ട്‌സും മനോരമ ഓൺലൈനും ചേർന്ന് നൽകിയ GOLDEN SALUTE AWARD.",
        body: "‘ഗോൾഡൻ സല്യൂട്ട്’ ഐ.ആർ.ഡബ്ല്യുവിന് സാമൂഹീക പ്രതിബദ്ധതയിലൂന്നിയ ജീവിതശൈലിയുടെ ഭാഗമായി ഐ.ആർ.ഡബ്ല്യു വളണ്ടിയർമാർ കോവിഡ് 19 എന്ന മഹാമാരിക്ക് മുമ്പിൽ സധീരം സൂക്ഷ്മമായി നിലകൊള്ളുകയാണ്. ഓരോ കോവിഡ് രോഗിയുടെയും ആശ്രിതരെല്ലാം അശരണരായപ്പോൾ അഭയകേന്ദ്രമായി മാറുകയായിരുന്നു ഐ.ആർ.ഡബ്ല്യു.\n\nകോവിഡ്കാല സേവനം മുൻനിർത്തി മലബാർ ഗോൾഡ് ആന്റ് ഡയമണ്ട്‌സും മനോരമ ഓൺലൈനും ചേർന്ന് നടത്തിയ ജനകീയ വോട്ടെടുപ്പിൽ ഗ്രൂപ്പ് ഇനത്തിൽ GOLDEN SALUTE AWARD’ന് തെരഞ്ഞെടുത്തു.",
        tags: "Award,COVID-19",
        featured: true,
        publishedAt: new Date("2021-02-17T10:00:00Z"),
      },
      {
        type: "ACHIEVEMENT",
        title: "പെട്ടിമുടി ദുരന്തമേഖലയിലെ സേവനത്തിന് ഐഡിയൽ റിലീഫ് വിങിന് ആദരം",
        slug: "pettimudi-honour",
        excerpt: "മൂന്നാർ സി.പി.ഐ ആസ്ഥാനത്ത് നടന്ന ചടങ്ങിൽ ഭാരവാഹികൾ ആദരം ഏറ്റുവാങ്ങി.",
        body: "ഇടുക്കി : മൂന്നാർ പെട്ടിമുടി ദുരന്തമേഖലയിൽ സേവന നിരതരായിരുന്ന ഐഡിയൽ റിലീഫ് വിങിന് വേണ്ടി, മൂന്നാർ സി.പി.ഐ ആസ്ഥാനത്ത് നടന്ന ചടങ്ങിൽ വെച്ച് ഭാരവാഹികൾ ആദരം ഏറ്റുവാങ്ങുന്നു.",
        tags: "Honour,Munnar",
        featured: false,
        publishedAt: new Date("2020-10-14T10:00:00Z"),
      },
      {
        type: "ACHIEVEMENT",
        title: "പൂനൂർ പുഴയിൽ കാണാതായ സഹോദരിയെ കണ്ടെത്താൻ ഐ.ആർ.ഡബ്ല്യു വളണ്ടിയേഴ്‌സ്",
        slug: "poonoor-river-search",
        excerpt: "വാർഡ് മെമ്പർ ഫാത്തിമ ജസ്‌ലിന്റെ നന്ദി കുറിപ്പ്.",
        body: "കുന്ദമംഗലം പന്തീർപ്പാടം പൂനൂർ പുഴയിൽ പതിനൊന്നു ദിവസമായി റുക്കിയ (54) എന്നവരെ കാണാതായിട്ട്, നാട്ടുകാരും പോലീസും ഫയർഫോഴ്‌സും എല്ലാവിധത്തിലും അന്വേഷണം നടത്തിയിട്ടും കണ്ടെത്താനായിരുന്നില്ല. ഐ.ആർ.ഡബ്ല്യു ടീം മൂന്നു ബോട്ടുകളും മുഴുവൻ ഫോഴ്‌സും ഉപയോഗപ്പെടുത്തി രാവിലെ 7 മണിക്ക് പുനൂർ പുഴയിൽ തിരച്ചിൽ ആരംഭിച്ചു. ഏതാണ്ട് 10 മണിയോടെ പാറക്കടവ് പാലത്തിനോട് അടുത്തുള്ള കടവിൽ വച്ചു മൃതദേഹം കണ്ടെത്തി.\n\n— ഫാത്തിമ ജസ്‌ലിൻ, വാർഡ് മെമ്പർ, കുന്ദമംഗലം ഗ്രാമപഞ്ചായത്ത്.",
        tags: "Search,Kozhikode",
        featured: false,
        publishedAt: new Date("2021-12-01T10:00:00Z"),
      },
    ];
    for (const p of posts) await db.post.create({ data: { ...p, status: "PUBLISHED", authorName: "Site Admin" } });
  }

  if ((await db.teamMember.count()) === 0) {
    const names = ["Basheer Sharqi", "Shameer V.I", "Asif Ali P.K", "Sharafudheen P", "Muhammed Ashraf P", "Shajeer K", "Shajeel Bin Hassan", "Fazuludheen M"];
    for (const [i, name] of names.entries()) {
      await db.teamMember.create({ data: { name, designation: "Governing Body Member", groupName: "GOVERNING", sort: i } });
    }
  }

  if ((await db.publication.count()) === 0) {
    const base = "https://www.irwkerala.org/wp-content/uploads";
    await db.publication.createMany({
      data: [
        { title: "Annual Report 2020", category: "ANNUAL", year: 2020, fileUrl: `${base}/2025/09/IRW_new_report_2020-compressed.pdf` },
        { title: "Annual Report 2020 – 2021", category: "ANNUAL", year: 2021, fileUrl: `${base}/2025/08/IRW-Kerala-Report-2020-2021-for-IT-Dept.pdf` },
        { title: "Annual Report 2019 – 2020", category: "ANNUAL", year: 2020, fileUrl: `${base}/2025/08/IRW-Kerala-Report-2019-2020-for-IT-Dept.pdf` },
      ],
    });
  }

  if ((await db.album.count()) === 0) {
    const albums = [
      ["Rescue operations", ["Boat search team", "Night search", "Landslide rescue", "River search"]],
      ["Relief & service", ["Food kit distribution", "Medicine delivery", "Ambulance service"]],
      ["Training", ["Water rescue drill", "Fire & safety training", "First-aid workshop"]],
    ] as const;
    let n = 0;
    for (const [ai, [name, caps]] of albums.entries()) {
      const album = await db.album.create({ data: { name, slug: name.toLowerCase().replace(/[^a-z]+/g, "-"), sort: ai } });
      for (const [ci, caption] of caps.entries()) {
        const file = `seed/sample-${n}.svg`;
        fs.writeFileSync(path.join(UPLOADS, file), sampleSvg(`Sample photo · ${caption}`, n));
        await db.photo.create({ data: { albumId: album.id, url: `/files/${file}`, caption, sort: ci } });
        n++;
      }
    }
  }

  await db.activity.create({ data: { actor: "System", verb: "seeded the database", kind: "info" } });
  console.log(`Seed complete. Admin: ${ADMIN_EMAIL}  Password: ${ADMIN_PASSWORD}`);
}

main().finally(() => db.$disconnect());

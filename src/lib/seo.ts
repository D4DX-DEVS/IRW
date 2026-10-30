import type { Settings } from "./settings";

/**
 * Canonical origin of the public site. Pages are prerendered at build time, when the Worker's
 * SITE_URL var is not available, so the production origin is the default (also in local dev).
 */
export const siteUrl = (): string => (process.env.SITE_URL || "https://irwkerala.org").replace(/\/$/, "");

export const SITE_DESCRIPTION =
  "Ideal Relief Wing (IRW) Kerala is a registered NGO founded in 1992 that trains volunteers for disaster rescue, relief, rehabilitation and reconstruction across Kerala and India — floods, landslides, earthquakes, accidents and epidemics.";

type JsonLdObject = Record<string, unknown>;

const phones = (s: Settings): string[] => [s.phone1, s.phone2, s.phone3].filter(Boolean);

/** The organisation itself (schema.org NGO), shared by every page through its @id. */
export function organizationLd(s: Settings): JsonLdObject {
  const base = siteUrl();
  return {
    "@type": "NGO",
    "@id": `${base}/#organization`,
    name: s.orgName,
    alternateName: ["IRW Kerala", "IRW", "Ideal Relief Wing"],
    url: base,
    ...(s.logoUrl ? { logo: s.logoUrl, image: s.logoUrl } : {}),
    description: SITE_DESCRIPTION,
    slogan: s.tagline,
    foundingDate: s.founded,
    email: s.email,
    telephone: s.phone1,
    address: {
      "@type": "PostalAddress",
      // The address is editable in the admin, so it is given whole; region and country do not change.
      streetAddress: s.address,
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    areaServed: [{ "@type": "State", name: "Kerala" }, { "@type": "Country", name: "India" }],
    knowsAbout: ["Disaster management", "Search and rescue", "Flood relief", "Landslide rescue", "Water rescue", "Disaster rehabilitation", "Volunteer training", "First aid"],
    contactPoint: phones(s).map((telephone) => ({ "@type": "ContactPoint", telephone, contactType: "emergency", areaServed: "IN", availableLanguage: ["en", "ml"] })),
    sameAs: [s.facebook, s.youtube].filter(Boolean),
  };
}

export function websiteLd(s: Settings): JsonLdObject {
  const base = siteUrl();
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: s.orgName,
    inLanguage: ["en", "ml"],
    publisher: { "@id": `${base}/#organization` },
    potentialAction: { "@type": "SearchAction", target: `${base}/news-events?search={search_term_string}`, "query-input": "required name=search_term_string" },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): JsonLdObject {
  const base = siteUrl();
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${base}${it.path}` })),
  };
}

export interface ArticleInput {
  title: string;
  slug: string;
  description: string;
  image: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
  tags: string[];
}

export function articleLd(a: ArticleInput): JsonLdObject {
  const base = siteUrl();
  const url = `${base}/news-events/${a.slug}`;
  return {
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: a.title.slice(0, 110),
    description: a.description,
    ...(a.image ? { image: [a.image] } : {}),
    datePublished: (a.publishedAt ?? a.updatedAt).toISOString(),
    dateModified: a.updatedAt.toISOString(),
    author: a.authorName ? { "@type": "Person", name: a.authorName } : { "@id": `${base}/#organization` },
    publisher: { "@id": `${base}/#organization` },
    ...(a.tags.length ? { keywords: a.tags.join(", ") } : {}),
  };
}

/** Serialises a JSON-LD graph for a <script> tag; "<" is escaped so content can never close the tag. */
export function jsonLd(...nodes: JsonLdObject[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}

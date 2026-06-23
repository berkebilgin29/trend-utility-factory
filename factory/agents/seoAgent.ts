import type { Brief } from "./briefSchema.js";

export type SeoBundle = {
  title: string;
  description: string;
  keywords: string[];
  jsonLd: Record<string, unknown>;
  sitemap: string;
  robots: string;
};

export function buildJsonLd(brief: Brief): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: brief.title,
    description: brief.description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: brief.features,
    audience: { "@type": "Audience", audienceType: brief.audience },
    mainEntity: brief.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };
}

export function buildSitemap(slug: string, baseUrl = "https://example.com"): string {
  const url = baseUrl.replace(/\/$/, "") + "/" + slug + "/";
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    "    <loc>" + escapeXml(url) + "</loc>",
    "    <changefreq>weekly</changefreq>",
    "    <priority>0.8</priority>",
    "  </url>",
    "</urlset>",
    ""
  ].join("\n");
}

export function buildRobots(): string {
  return ["User-agent: *", "Allow: /", "Sitemap: /sitemap.xml", ""].join("\n");
}

export function buildSeoBundle(brief: Brief): SeoBundle {
  return {
    title: brief.title,
    description: brief.description,
    keywords: brief.keywords,
    jsonLd: buildJsonLd(brief),
    sitemap: buildSitemap(brief.slug),
    robots: buildRobots()
  };
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;"
    };
    return entities[char] ?? char;
  });
}


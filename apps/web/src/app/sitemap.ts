import type { MetadataRoute } from "next";

const BASE = "https://remote-work-radar-web-g6sb.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["/", "/jobs", "/onboarding", "/glossary", "/templates", "/signin"].map(
    (path) => ({ url: `${BASE}${path}`, lastModified: now }),
  );
}

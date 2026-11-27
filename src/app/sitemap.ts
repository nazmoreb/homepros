import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/quote", "/contractors", "/privacy", "/terms", ...categories.map((category) => `/${category.slug}`)];
  return paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}

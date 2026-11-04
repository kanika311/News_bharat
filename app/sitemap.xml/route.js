import { connectDB } from "@/lib/db";
const Article = require("@/server/models/Article");
const Category = require("@/server/models/Category");

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const baseUrl = process.env.SITE_URL || "http://localhost:3000";

  const [articles, categories] = await Promise.all([
    Article.find({ status: "published", isDeleted: { $ne: true } })
      .select("slug category updatedAt")
      .populate("category", "slug")
      .lean(),
    Category.find().select("slug updatedAt").lean(),
  ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static core routes
  xml += `  <url>\n    <loc>${baseUrl}</loc>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${baseUrl}/videos</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

  // Categories
  categories.forEach((cat) => {
    xml += `  <url>\n    <loc>${baseUrl}/${cat.slug}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Articles
  articles.forEach((art) => {
    const catSlug = art.category?.slug || "news";
    xml += `  <url>\n    <loc>${baseUrl}/${catSlug}/${art.slug}</loc>\n    <lastmod>${new Date(art.updatedAt).toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}

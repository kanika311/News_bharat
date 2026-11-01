import { connectDB } from "@/lib/db";
const Article = require("@/server/models/Article");

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const baseUrl = process.env.SITE_URL || "http://localhost:3000";

  // Google News Sitemap includes articles published in the last 48 hours
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const articles = await Article.find({
    status: "published",
    isDeleted: { $ne: true },
    publishedAt: { $gte: twoDaysAgo },
  })
    .select("title slug language publishedAt category")
    .populate("category", "slug")
    .sort("-publishedAt")
    .limit(1000)
    .lean();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  articles.forEach((art) => {
    const catSlug = art.category?.slug || "news";
    const escapeXml = (unsafe) =>
      unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&apos;";
          case '"': return "&quot;";
        }
      });

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/${catSlug}/${art.slug}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>Swar Media</news:name>\n`;
    xml += `        <news:language>${art.language || "hi"}</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${new Date(art.publishedAt).toISOString()}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(art.title)}</news:title>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800",
    },
  });
}

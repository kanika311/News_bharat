const cron = require("node-cron");
const Article = require("./models/Article");

function initCronJobs() {
  // Run every minute: check for scheduled articles ready to be published
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const readyArticles = await Article.find({
        status: "scheduled",
        isDeleted: { $ne: true },
        scheduledAt: { $lte: now },
      });

      if (readyArticles.length > 0) {
        console.log(`[Cron] Found ${readyArticles.length} scheduled article(s) ready for publishing.`);
        for (const art of readyArticles) {
          art.status = "published";
          art.publishedAt = art.scheduledAt || now;
          await art.save();
          console.log(`[Cron] Auto-published article: "${art.title}" (${art.slug})`);
        }
      }
    } catch (err) {
      console.error("[Cron] Error processing scheduled articles:", err.message);
    }
  });

  console.log("[Cron] Scheduled publication task initialized (every minute)");
}

module.exports = { initCronJobs };

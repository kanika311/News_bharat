const slugify = require("slugify");

/**
 * Generate a clean, SEO-friendly slug.
 * Handles English text as well as Unicode / Devanagari (Hindi) scripts.
 */
function createSlug(text) {
  if (!text) return `article-${Date.now()}`;

  // Basic slugify with unicode preservation
  let slug = slugify(text, {
    lower: true,
    strict: false,
    remove: /[*+~.()'"!:@\/\\?#\[\]{}|%^&=<>]/g,
  });

  // If slugify stripped everything (e.g. some unicode scripts without transliteration), fallback cleanly
  if (!slug || slug.trim() === "") {
    slug = text
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, "-")
      .replace(/[^\p{L}\p{N}\-]/gu, "");
  }

  // Final fallback
  if (!slug) {
    slug = `news-${Date.now()}`;
  }

  return slug.substring(0, 120);
}

/**
 * Ensures slug is unique in a given Mongoose model
 */
async function makeUniqueSlug(model, text, currentId = null) {
  let baseSlug = createSlug(text);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const exists = await model.findOne(query).select("_id").lean();
    if (!exists) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Estimate reading time in minutes
 */
function calculateReadingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).length;
  const wpm = 180;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

module.exports = {
  createSlug,
  makeUniqueSlug,
  calculateReadingTime,
};

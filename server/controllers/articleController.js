const Article = require("../models/Article");
const Category = require("../models/Category");
const { makeUniqueSlug, calculateReadingTime } = require("../utils/slugify");
const { logActivity } = require("../utils/activity");

// GET /api/articles
exports.getArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      categorySlug,
      tag,
      author,
      status,
      language,
      search,
      isBreaking,
      isFeatured,
      isTrending,
      isTopStory,
      trashed,
      sort = "-publishedAt",
    } = req.query;

    const query = {};

    // Soft delete check
    if (trashed === "true") {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
    }

    // Category filter by ID or Slug
    if (category) {
      query.category = category;
    } else if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) {
        query.category = cat._id;
      } else {
        return res.json({ success: true, articles: [], total: 0, totalPages: 0, page: Number(page) });
      }
    }

    if (tag) query.tags = tag;
    if (author) {
      if (author === "me" && req.user) {
        query.author = req.user._id;
      } else {
        query.author = author;
      }
    }
    if (status) query.status = status;
    if (language) query.language = language;

    if (isBreaking === "true") query.isBreaking = true;
    if (isFeatured === "true") query.isFeatured = true;
    if (isTrending === "true") query.isTrending = true;
    if (isTopStory === "true") query.isTopStory = true;

    // Search query
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { subtitle: regex }, { excerpt: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      Article.find(query)
        .select("-content -contentHi")
        .populate("category", "name nameHi slug color")
        .populate("subCategory", "name nameHi slug")
        .populate("author", "name email avatar")
        .populate("tags", "name nameHi slug")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Article.countDocuments(query),
    ]);

    // Fast Edge caching for public queries
    if (!author && (!status || status === "published") && trashed !== "true") {
      res.set("Cache-Control", "public, s-maxage=45, stale-while-revalidate=120");
    }

    return res.json({
      success: true,
      articles,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      page: pageNum,
    });
  } catch (err) {
    console.error("getArticles error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/articles/slug/:slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug, isDeleted: { $ne: true } })
      .populate("category", "name nameHi slug color")
      .populate("subCategory", "name nameHi slug")
      .populate("author", "name email avatar bio bioHi")
      .populate("tags", "name nameHi slug");

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    // Increment view count asynchronously
    article.viewCount += 1;
    await article.save();

    return res.json({ success: true, article });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/articles/:id
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id)
      .populate("category", "name nameHi slug")
      .populate("subCategory", "name nameHi slug")
      .populate("author", "name email avatar")
      .populate("tags", "name nameHi slug");

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    return res.json({ success: true, article });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/articles
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      slug,
      language = "hi",
      content,
      excerpt,
      location,
      category,
      subCategory,
      tags = [],
      featuredImage,
      galleryImages = [],
      galleryVideos = [],
      status = "draft",
      scheduledAt,
      isBreaking = false,
      isFeatured = false,
      isTrending = false,
      isTopStory = false,
      seo,
      socialShares,
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required fields.",
      });
    }

    // Citizen journalists & readers can submit news for editorial approval
    let finalStatus = status;
    if (["reader", "subscriber"].includes(req.user.role)) {
      finalStatus = "pending";
    }

    // Unique slug generation
    const uniqueSlug = await makeUniqueSlug(Article, slug || title);
    const readingTime = calculateReadingTime(content);

    // Published date determination
    let publishedAt = null;
    if (finalStatus === "published") {
      publishedAt = new Date();
    }

    // Clean gallery images & videos
    const cleanGalleryImages = Array.isArray(galleryImages)
      ? galleryImages
          .filter((item) => item && (typeof item === "string" ? item.trim() : item.url && item.url.trim()))
          .map((item) =>
            typeof item === "string"
              ? { url: item.trim(), caption: "", alt: "" }
              : { url: item.url.trim(), caption: item.caption || "", alt: item.alt || "" }
          )
      : [];

    const cleanGalleryVideos = Array.isArray(galleryVideos)
      ? galleryVideos
          .filter((item) => item && (typeof item === "string" ? item.trim() : item.url && item.url.trim()))
          .map((item) =>
            typeof item === "string"
              ? { url: item.trim(), title: "", caption: "" }
              : { url: item.url.trim(), title: item.title || "", caption: item.caption || "" }
          )
      : [];

    const newArticle = new Article({
      title,
      subtitle,
      slug: uniqueSlug,
      language,
      content,
      excerpt: excerpt || title,
      location: location || "सुल्तानपुर",
      category,
      subCategory: subCategory || null,
      tags,
      author: req.user._id,
      featuredImage: featuredImage || { url: "", caption: "", alt: title },
      galleryImages: cleanGalleryImages,
      galleryVideos: cleanGalleryVideos,
      status: finalStatus,
      scheduledAt: finalStatus === "scheduled" && scheduledAt ? new Date(scheduledAt) : null,
      publishedAt,
      isBreaking: Boolean(isBreaking),
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isTopStory: Boolean(isTopStory),
      readingTime,
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt || title,
        keywords: [],
      },
      socialShares: socialShares || {},
    });

    await newArticle.save();

    await logActivity(req, "CREATE_ARTICLE", "article", `Created article: "${title}" (${uniqueSlug})`);

    return res.status(201).json({
      success: true,
      article: newArticle,
      message: "Article created successfully",
    });
  } catch (err) {
    console.error("createArticle error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/articles/:id
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    // Role check: reporter can only edit their own article unless editor/superadmin
    if (req.user.role === "reporter" && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Reporters can only modify their own articles.",
      });
    }

    const {
      title,
      subtitle,
      slug,
      language,
      content,
      excerpt,
      category,
      subCategory,
      tags,
      featuredImage,
      galleryImages,
      galleryVideos,
      location,
      status,
      scheduledAt,
      isBreaking,
      isFeatured,
      isTrending,
      isTopStory,
      seo,
      socialShares,
    } = req.body;

    if (title !== undefined) article.title = title;
    if (subtitle !== undefined) article.subtitle = subtitle;
    if (content !== undefined) {
      article.content = content;
      article.readingTime = calculateReadingTime(content);
    }
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (language !== undefined) article.language = language;
    if (category !== undefined) article.category = category;
    if (subCategory !== undefined) article.subCategory = subCategory || null;
    if (tags !== undefined) article.tags = tags;
    if (featuredImage !== undefined) article.featuredImage = featuredImage;
    if (galleryImages !== undefined) {
      article.galleryImages = Array.isArray(galleryImages)
        ? galleryImages
            .filter((item) => item && (typeof item === "string" ? item.trim() : item.url && item.url.trim()))
            .map((item) =>
              typeof item === "string"
                ? { url: item.trim(), caption: "", alt: "" }
                : { url: item.url.trim(), caption: item.caption || "", alt: item.alt || "" }
            )
        : [];
    }
    if (galleryVideos !== undefined) {
      article.galleryVideos = Array.isArray(galleryVideos)
        ? galleryVideos
            .filter((item) => item && (typeof item === "string" ? item.trim() : item.url && item.url.trim()))
            .map((item) =>
              typeof item === "string"
                ? { url: item.trim(), title: "", caption: "" }
                : { url: item.url.trim(), title: item.title || "", caption: item.caption || "" }
            )
        : [];
    }
    if (location !== undefined) article.location = location;

    // Handle slug update
    if (slug && slug !== article.slug) {
      article.slug = await makeUniqueSlug(Article, slug, article._id);
    }

    // Status transitions
    if (status !== undefined) {
      if (status === "published" && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      article.status = status;
    }

    if (scheduledAt !== undefined) {
      article.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }

    if (isBreaking !== undefined) article.isBreaking = Boolean(isBreaking);
    if (isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
    if (isTrending !== undefined) article.isTrending = Boolean(isTrending);
    if (isTopStory !== undefined) article.isTopStory = Boolean(isTopStory);
    if (seo !== undefined) article.seo = seo;
    if (socialShares !== undefined) {
      article.socialShares = { ...(article.socialShares || {}), ...socialShares };
    }

    await article.save();

    await logActivity(req, "UPDATE_ARTICLE", "article", `Updated article: "${article.title}"`);

    return res.json({
      success: true,
      article,
      message: "Article updated successfully",
    });
  } catch (err) {
    console.error("updateArticle error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/articles/:id (Soft delete)
exports.softDeleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    article.isDeleted = true;
    article.deletedAt = new Date();
    await article.save();

    await logActivity(req, "TRASH_ARTICLE", "article", `Moved article to trash: "${article.title}"`);

    return res.json({ success: true, message: "Article moved to trash" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/articles/:id/restore
exports.restoreArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    article.isDeleted = false;
    article.deletedAt = null;
    await article.save();

    await logActivity(req, "RESTORE_ARTICLE", "article", `Restored article from trash: "${article.title}"`);

    return res.json({ success: true, message: "Article restored successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/articles/:id/permanent
exports.permanentDeleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    await logActivity(req, "PERMANENT_DELETE_ARTICLE", "article", `Permanently deleted article: "${article.title}"`);

    return res.json({ success: true, message: "Article permanently deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/articles/bulk
exports.bulkAction = async (req, res) => {
  try {
    const { action, ids = [] } = req.body;
    if (!ids.length) {
      return res.status(400).json({ success: false, message: "No article IDs provided" });
    }

    if (action === "trash") {
      await Article.updateMany(
        { _id: { $in: ids } },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );
      await logActivity(req, "BULK_TRASH", "article", `Trashed ${ids.length} articles`);
      return res.json({ success: true, message: `${ids.length} articles moved to trash` });
    }

    if (action === "restore") {
      await Article.updateMany(
        { _id: { $in: ids } },
        { $set: { isDeleted: false, deletedAt: null } }
      );
      await logActivity(req, "BULK_RESTORE", "article", `Restored ${ids.length} articles`);
      return res.json({ success: true, message: `${ids.length} articles restored` });
    }

    if (action === "publish") {
      await Article.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "published", publishedAt: new Date() } }
      );
      await logActivity(req, "BULK_PUBLISH", "article", `Published ${ids.length} articles`);
      return res.json({ success: true, message: `${ids.length} articles published` });
    }

    if (action === "delete_permanent") {
      await Article.deleteMany({ _id: { $in: ids } });
      await logActivity(req, "BULK_PERMANENT_DELETE", "article", `Deleted ${ids.length} articles permanently`);
      return res.json({ success: true, message: `${ids.length} articles permanently deleted` });
    }

    return res.status(400).json({ success: false, message: "Invalid bulk action" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/articles/related/:id
exports.getRelatedArticles = async (req, res) => {
  try {
    const { id } = req.params;
    const current = await Article.findById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    const related = await Article.find({
      _id: { $ne: current._id },
      isDeleted: { $ne: true },
      status: "published",
      $or: [{ category: current.category }, { tags: { $in: current.tags } }],
    })
      .populate("category", "name nameHi slug color")
      .populate("author", "name avatar")
      .limit(6)
      .sort("-publishedAt")
      .lean();

    return res.json({ success: true, articles: related });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/articles/:id/like (Public reader like / toggle)
exports.likeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body || {};
    const incVal = action === "unlike" ? -1 : 1;

    const existing = await Article.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    const newLikes = Math.max(0, (existing.likesCount || 0) + incVal);
    existing.likesCount = newLikes;
    await existing.save();

    return res.json({
      success: true,
      likesCount: newLikes,
      message: action === "unlike" ? "Article unliked" : "Article liked successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/articles/:id/social-share (Record social broadcast)
exports.recordSocialShare = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body || {};
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    if (!article.socialShares) {
      article.socialShares = {};
    }
    if (platform) {
      article.socialShares[platform] = true;
    }
    article.socialShares.sharedAt = new Date();
    await article.save();

    await logActivity(
      req,
      "SHARE_ARTICLE",
      "article",
      `Shared article "${article.title}" to ${platform || "social channels"}`
    );

    return res.json({ success: true, socialShares: article.socialShares });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

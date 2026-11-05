const path = require("path");
const fs = require("fs");
const EPaper = require("../models/EPaper");

// GET /api/epaper (Public - Latest or Date-Filtered E-Paper with Archives list)
exports.getPublicEPaper = async (req, res) => {
  try {
    const { date, edition } = req.query;

    let query = { isActive: true };

    if (edition && edition !== "all") {
      query.edition = new RegExp(edition, "i");
    }

    let epaper = null;
    let requestedDateFound = true;

    if (date) {
      // Look for newspaper matching the specific date YYYY-MM-DD
      const dateString = date.trim();
      const startOfDay = new Date(dateString + "T00:00:00.000Z");
      const endOfDay = new Date(dateString + "T23:59:59.999Z");

      const dateQuery = {
        isActive: true,
        $or: [
          { dateStr: dateString },
          { date: { $gte: startOfDay, $lte: endOfDay } },
        ],
      };
      if (edition && edition !== "all") {
        dateQuery.edition = new RegExp(edition, "i");
      }

      epaper = await EPaper.findOne(dateQuery).sort({ createdAt: -1 });
      if (!epaper) {
        requestedDateFound = false;
      }
    }

    // Latest active paper overall (for fallback / recommendation)
    const latestEpaper = await EPaper.findOne({ isActive: true }).sort({ date: -1, createdAt: -1 });

    // If no date was requested, default to latest active
    if (!date) {
      epaper = latestEpaper;
    }

    // Increment view count if an edition was viewed
    if (epaper) {
      await EPaper.findByIdAndUpdate(epaper._id, { $inc: { views: 1 } });
    }

    // Fetch archive editions list so readers can filter and view past newspapers
    const allActive = await EPaper.find({ isActive: true })
      .select("_id title edition date dateStr pdfUrl thumbnailUrl pageCount fileSize views downloads")
      .sort({ date: -1, createdAt: -1 })
      .limit(90)
      .lean();

    const archiveDates = allActive.map((item) => ({
      _id: item._id,
      title: item.title,
      edition: item.edition,
      date: item.date,
      dateStr: item.dateStr || (item.date ? item.date.toISOString().split("T")[0] : ""),
      pdfUrl: item.pdfUrl,
      thumbnailUrl: item.thumbnailUrl,
      pageCount: item.pageCount,
      fileSize: item.fileSize,
      views: item.views || 0,
      downloads: item.downloads || 0,
    }));

    // Unique editions from database
    const rawEditions = Array.from(new Set(allActive.map((item) => item.edition))).filter(Boolean);
    const standardEditions = ["लखनऊ मुख्य संस्करण", "सुल्तानपुर", "दिल्ली मुख्य संस्करण", "राष्ट्रीय"];
    const combinedEditions = Array.from(new Set([...rawEditions, ...standardEditions]));

    return res.json({
      success: true,
      epaper,
      latestEpaper,
      requestedDateFound,
      archiveDates,
      editions: combinedEditions,
    });
  } catch (err) {
    console.error("getPublicEPaper error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/epaper/admin/list (Admin panel list of all uploaded newspapers)
exports.getAdminEPapers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status = "all" } = req.query;

    const query = {};

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    if (search.trim()) {
      query.$or = [
        { title: new RegExp(search.trim(), "i") },
        { edition: new RegExp(search.trim(), "i") },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [epapers, total] = await Promise.all([
      EPaper.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      EPaper.countDocuments(query),
    ]);

    return res.json({
      success: true,
      epapers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    console.error("getAdminEPapers error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/epaper (Admin - Upload new PDF newspaper)
exports.createEPaper = async (req, res) => {
  try {
    const { title, edition, date, thumbnailUrl, pageCount, isActive } = req.body;

    let pdfUrl = req.body.pdfUrl || "";
    let fileSize = req.body.fileSize || "";

    // Handle uploaded PDF file via Multer
    if (req.file) {
      pdfUrl = `/uploads/${req.file.filename}`;
      if (req.file.size) {
        fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      }
    }

    if (!pdfUrl) {
      return res.status(400).json({
        success: false,
        message: "कृपया समाचार पत्र की PDF फाइल अपलोड करें या PDF लिंक (URL) दर्ज करें।",
      });
    }

    const epaperDate = date ? new Date(date) : new Date();
    const dateStr = date ? date.split("T")[0] : epaperDate.toISOString().split("T")[0];

    const epaper = await EPaper.create({
      title: title?.trim() || `दैनिक स्वर मीडिया - ${epaperDate.toLocaleDateString("hi-IN")}`,
      edition: edition?.trim() || "लखनऊ मुख्य संस्करण",
      date: epaperDate,
      dateStr,
      pdfUrl: pdfUrl.trim(),
      thumbnailUrl: thumbnailUrl?.trim() || "",
      pageCount: parseInt(pageCount, 10) || 4,
      fileSize,
      isActive: isActive === undefined ? true : isActive === "true" || isActive === true,
      uploadedBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      epaper,
      message: "समाचार पत्र PDF सफलतापूर्वक अपलोड हो गया!",
    });
  } catch (err) {
    console.error("createEPaper error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/epaper/:id (Admin - Edit newspaper)
exports.updateEPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, edition, date, thumbnailUrl, pageCount, isActive } = req.body;

    const epaper = await EPaper.findById(id);
    if (!epaper) {
      return res.status(404).json({ success: false, message: "Newspaper not found" });
    }

    if (title) epaper.title = title.trim();
    if (edition) epaper.edition = edition.trim();
    if (date) {
      epaper.date = new Date(date);
      epaper.dateStr = date.split("T")[0];
    }
    if (thumbnailUrl !== undefined) epaper.thumbnailUrl = thumbnailUrl.trim();
    if (pageCount !== undefined) epaper.pageCount = parseInt(pageCount, 10) || 4;
    if (isActive !== undefined) epaper.isActive = isActive === "true" || isActive === true;

    // Handle new uploaded PDF file
    if (req.file) {
      // Delete old local file if present
      if (epaper.pdfUrl && epaper.pdfUrl.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), "public", epaper.pdfUrl);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) {}
        }
      }
      epaper.pdfUrl = `/uploads/${req.file.filename}`;
      if (req.file.size) {
        epaper.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      }
    } else if (req.body.pdfUrl) {
      epaper.pdfUrl = req.body.pdfUrl.trim();
    }

    await epaper.save();

    return res.json({
      success: true,
      epaper,
      message: "समाचार पत्र सफलतापूर्वक अपडेट कर दिया गया!",
    });
  } catch (err) {
    console.error("updateEPaper error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/epaper/:id/toggle-status (Admin - Quick Toggle Active/Inactive)
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const epaper = await EPaper.findById(id);
    if (!epaper) {
      return res.status(404).json({ success: false, message: "Newspaper not found" });
    }

    epaper.isActive = !epaper.isActive;
    await epaper.save();

    return res.json({
      success: true,
      isActive: epaper.isActive,
      message: epaper.isActive ? "समाचार पत्र सक्रिय (Active) कर दिया गया" : "समाचार पत्र निष्क्रिय (Inactive) कर दिया गया",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/epaper/:id (Admin - Delete newspaper)
exports.deleteEPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const epaper = await EPaper.findById(id);
    if (!epaper) {
      return res.status(404).json({ success: false, message: "Newspaper not found" });
    }

    // Remove local file if present
    if (epaper.pdfUrl && epaper.pdfUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", epaper.pdfUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    await EPaper.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "समाचार पत्र सफलतापूर्वक हटा दिया गया!",
    });
  } catch (err) {
    console.error("deleteEPaper error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/epaper/:id/download (Public - Track download count)
exports.trackDownload = async (req, res) => {
  try {
    const { id } = req.params;
    await EPaper.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

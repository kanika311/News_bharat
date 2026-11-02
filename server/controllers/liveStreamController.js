const path = require("path");
const fs = require("fs");
const LiveStream = require("../models/LiveStream");

// Ensure live stream record exists
const getOrCreateLiveStream = async () => {
  let stream = await LiveStream.findOne();
  if (!stream) {
    stream = await LiveStream.create({
      title: "Ground Report: Special Live Field Coverage",
      titleHi: "ग्राउंड रिपोर्ट: संसद परिसर से विशेष लाइव कवरेज",
      reporterName: "राजेश शर्मा (विशेष संवाददाता)",
      reporterLocation: "संसद भवन, नई दिल्ली",
      streamType: "camera",
      streamUrl: "https://www.youtube.com/watch?v=live_stream",
      cameraVideoUrl: "",
      isLive: true,
      viewers: 1540,
      breakingHeadline: "बड़ी खबर: स्वर मीडिया रिपोर्टर सीधे ग्राउंड जीरो से लाइव",
    });
  }
  return stream;
};

// GET /api/live-stream
exports.getLiveStream = async (req, res) => {
  try {
    const stream = await getOrCreateLiveStream();
    res.json({ success: true, liveStream: stream });
  } catch (error) {
    console.error("getLiveStream error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/live-stream (Protected: admin / journalist)
exports.updateLiveStream = async (req, res) => {
  try {
    let stream = await getOrCreateLiveStream();

    const {
      title,
      titleHi,
      reporterName,
      reporterLocation,
      streamType,
      streamUrl,
      cameraVideoUrl,
      isLive,
      viewers,
      breakingHeadline,
    } = req.body;

    if (title !== undefined) stream.title = title;
    if (titleHi !== undefined) stream.titleHi = titleHi;
    if (reporterName !== undefined) stream.reporterName = reporterName;
    if (reporterLocation !== undefined) stream.reporterLocation = reporterLocation;
    if (streamType !== undefined) stream.streamType = streamType;
    if (streamUrl !== undefined) stream.streamUrl = streamUrl;
    if (cameraVideoUrl !== undefined) stream.cameraVideoUrl = cameraVideoUrl;
    if (isLive !== undefined) stream.isLive = Boolean(isLive);
    if (viewers !== undefined) stream.viewers = Number(viewers);
    if (breakingHeadline !== undefined) stream.breakingHeadline = breakingHeadline;

    if (isLive) {
      stream.startedAt = new Date();
    }

    await stream.save();
    res.json({ success: true, liveStream: stream });
  } catch (error) {
    console.error("updateLiveStream error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/live-stream/upload-chunk
// Uploads live recording chunks / video from journalist camera
exports.uploadCameraBroadcast = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video chunk uploaded" });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    let stream = await getOrCreateLiveStream();
    stream.cameraVideoUrl = publicUrl;
    stream.streamType = "camera";
    stream.isLive = true;
    if (!stream.startedAt) {
      stream.startedAt = new Date();
    }
    if (req.user && (!stream.reporterName || stream.reporterName === "वरिष्ठ संवाददाता")) {
      stream.reporterName = req.user.name || "वरिष्ठ संवाददाता";
    }
    await stream.save();

    res.json({
      success: true,
      message: "Live video stream updated successfully",
      videoUrl: publicUrl,
      liveStream: stream,
    });
  } catch (error) {
    console.error("uploadCameraBroadcast error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

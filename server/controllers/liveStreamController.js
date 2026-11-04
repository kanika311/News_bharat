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
      viewers: 0,
      reactions: { heart: 0, fire: 0, clap: 0, shock: 0 },
      chatMessages: [],
      breakingHeadline: "बड़ी खबर: स्वर मीडिया रिपोर्टर सीधे ग्राउंड जीरो से लाइव",
    });
  }
  return stream;
};

// GET /api/live-stream
exports.getLiveStream = async (req, res) => {
  try {
    const stream = await getOrCreateLiveStream();
    if (!stream.reactions) {
      stream.reactions = { heart: 0, fire: 0, clap: 0, shock: 0 };
    }
    if (!stream.chatMessages) {
      stream.chatMessages = [];
    }
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

// POST /api/live-stream/chat
// Real viewer live comment
exports.addChatMessage = async (req, res) => {
  try {
    const { text, user } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "टिप्पणी खाली नहीं हो सकती" });
    }

    const stream = await getOrCreateLiveStream();
    const sender = (user && user.trim()) || (req.user && req.user.name) || "दर्शक";

    const newComment = {
      user: sender,
      text: text.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date(),
    };

    if (!Array.isArray(stream.chatMessages)) {
      stream.chatMessages = [];
    }

    stream.chatMessages.push(newComment);
    if (stream.chatMessages.length > 100) {
      stream.chatMessages = stream.chatMessages.slice(-100);
    }

    await stream.save();

    res.json({
      success: true,
      message: "टिप्पणी दर्ज की गई",
      chatMessage: newComment,
      chatMessages: stream.chatMessages,
    });
  } catch (error) {
    console.error("addChatMessage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/live-stream/reaction
// Real viewer live reaction
exports.addReaction = async (req, res) => {
  try {
    const { type } = req.body;
    const validTypes = ["heart", "fire", "clap", "shock"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: "अमान्य रिएक्शन प्रकार" });
    }

    const stream = await getOrCreateLiveStream();
    if (!stream.reactions) {
      stream.reactions = { heart: 0, fire: 0, clap: 0, shock: 0 };
    }

    stream.reactions[type] = (stream.reactions[type] || 0) + 1;
    await stream.save();

    res.json({
      success: true,
      reactions: stream.reactions,
    });
  } catch (error) {
    console.error("addReaction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

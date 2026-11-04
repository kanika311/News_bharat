import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
const User = require("@/server/models/User");
const Article = require("@/server/models/Article");
const Comment = require("@/server/models/Comment");

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 1. All articles written by this user
    const articles = await Article.find({ author: user._id, isDeleted: { $ne: true } })
      .populate("category", "name nameHi slug")
      .sort("-createdAt")
      .lean();

    // 2. All comments written by this user
    const comments = await Comment.find({ email: user.email })
      .populate("article", "title slug category")
      .sort("-createdAt")
      .lean();

    const stats = {
      totalPosts: articles.length,
      approvedCount: articles.filter((a) => a.status === "published").length,
      pendingCount: articles.filter((a) => a.status === "pending").length,
      draftCount: articles.filter((a) => a.status === "draft").length,
      totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
      totalLikes: articles.reduce((sum, a) => sum + (a.likesCount || 0), 0),
      totalComments: comments.length,
    };

    return NextResponse.json({
      success: true,
      user,
      articles,
      comments,
      stats,
    });
  } catch (err) {
    console.error("User activity API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


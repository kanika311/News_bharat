"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  MapPin,
  FileText,
  CheckCircle2,
  Award,
  Send,
  Image,
  Video,
  ThumbsUp,
  MessageSquare,
  Share2,
  Newspaper,
  LogOut,
  Edit3,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  Check,
  TrendingUp,
  Bookmark,
  ShieldCheck,
  Search,
  Upload,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";
import { useAuth } from "@/lib/authContext";

export default function CitizenJournalistDashboard() {
  const router = useRouter();
  const { lang, t } = useLang();
  const { refreshUser, logout } = useAuth();

  // Authentication & User State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'submit' | 'reports' | 'profile'

  // Submissions & Feed State
  const [categories, setCategories] = useState([]);
  const [myArticles, setMyArticles] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 101,
      author: "विकास शुक्ला",
      district: "सुल्तानपुर",
      role: "नागरिक पत्रकार",
      date: "30 Sep 2026, 02:15 PM",
      content:
        "सुल्तानपुर-कुड़वार मुख्य मार्ग पर आज स्थानीय प्रशासन द्वारा जलभराव की समस्या का निरीक्षण किया गया। उम्मीद है इस सप्ताह में नाला सफाई का कार्य पूरा कर लिया जाएगा।",
      image: null,
      likes: 3,
      userLiked: false,
      comments: [
        {
          id: 1,
          name: "सुरेश कुमार",
          text: "बहुत अच्छा प्रयास विकास जी, ग्राउंड रिपोर्टिंग के लिए धन्यवाद!",
          time: "2 घंटे पहले",
        },
      ],
    },
    {
      id: 102,
      author: "मो० रिज़वान खान",
      district: "लखनऊ",
      role: "नागरिक पत्रकार",
      date: "30 Sep 2026, 06:00 PM",
      content:
        "हज़रतगंज और विधान सभा मार्ग पर आज शाम यातायात व्यवस्था सुगम रही। स्वर मीडिया के सभी साथी पत्रकारों को नमस्कार! आप सभी अपने ज़िले की ताज़ा अपडेट ज़रूर साझा करें।",
      image: null,
      likes: 2,
      userLiked: false,
      comments: [],
    },
    {
      id: 103,
      author: "अमित तिवारी",
      district: "वाराणसी",
      role: "नागरिक पत्रकार",
      date: "01 Nov 2026, 11:30 AM",
      content:
        "काशी विश्वनाथ धाम में देव दीपावली की तैयारियां शुरू हो चुकी हैं। घाटों पर सुरक्षा और रोशनी की विशेष व्यवस्था की जा रही है।",
      image:
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
      likes: 7,
      userLiked: false,
      comments: [],
    },
  ]);

  // Quick Post State (in Community Feed)
  const [quickPostText, setQuickPostText] = useState("");
  const [quickPostImage, setQuickPostImage] = useState("");
  const [quickPostLoading, setQuickPostLoading] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);

  // New News Submission Form State (Editorial CMS)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("सुल्तानपुर");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingArticleImage, setUploadingArticleImage] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const articleImageInputRef = useRef(null);

  const [sourceInfo, setSourceInfo] = useState("");
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [articleSuccessMsg, setArticleSuccessMsg] = useState("");
  const [articleErrorMsg, setArticleErrorMsg] = useState("");

  // Comment input per post
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const avatarInputRef = useRef(null);

  // Toast / Share notification
  const [shareToast, setShareToast] = useState(false);

  // Center column scroll ref & wheel forwarder for sticky sidebars
  const centerRef = useRef(null);
  const handleSidebarWheel = (e) => {
    if (centerRef.current) {
      centerRef.current.scrollTop += e.deltaY;
    }
  };

  // Load User & Data
  useEffect(() => {
    async function initDashboard() {
      try {
        const authRes = await apiFetch("/api/auth/me");
        if (authRes.success && authRes.user) {
          setUser(authRes.user);
          setDistrict(authRes.user.district || "सुल्तानपुर");
          setProfileName(authRes.user.name || "");
          setProfileDistrict(authRes.user.district || "सुल्तानपुर");
          setProfilePhone(authRes.user.phone || "");
          setProfileBio(authRes.user.bio || "");
          setProfileAvatar(authRes.user.avatar || "");

          // Fetch user's submitted articles
          loadMyArticles(authRes.user._id);
        } else {
          // If not logged in, redirect to login
          router.push("/login?redirect=/dashboard");
          return;
        }

        // Fetch categories for news form
        const catsRes = await apiFetch("/api/categories");
        if (catsRes.success && catsRes.categories) {
          setCategories(catsRes.categories);
          if (catsRes.categories.length > 0) {
            setCategory(catsRes.categories[0]._id);
          }
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
        router.push("/login?redirect=/dashboard");
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router]);

  const loadMyArticles = async (userId) => {
    try {
      const res = await apiFetch(`/api/articles?author=${userId}`);
      if (res.success && res.articles) {
        setMyArticles(res.articles);
      }
    } catch (e) {
      console.error("Failed to load user articles", e);
    }
  };

  // Quick Post Submission (Community Feed)
  const handleQuickPost = (e) => {
    e.preventDefault();
    if (!quickPostText.trim()) return;

    setQuickPostLoading(true);
    const newPost = {
      id: Date.now(),
      author: user?.name || "नागरिक पत्रकार",
      district: user?.district || district || "सुल्तानपुर",
      role: "नागरिक पत्रकार",
      date: new Date().toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: quickPostText.trim(),
      image: quickPostImage.trim() || null,
      likes: 0,
      userLiked: false,
      comments: [],
    };

    setTimeout(() => {
      setCommunityPosts([newPost, ...communityPosts]);
      setQuickPostText("");
      setQuickPostImage("");
      setShowImagePrompt(false);
      setQuickPostLoading(false);
    }, 400);
  };

  // Social: Like Post
  const handleLikePost = (postId) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: p.userLiked ? p.likes - 1 : p.likes + 1,
            userLiked: !p.userLiked,
          };
        }
        return p;
      })
    );
  };

  // Social: Add Comment
  const handleAddComment = (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    const newComment = {
      id: Date.now(),
      name: user?.name || "नागरिक पत्रकार",
      text,
      time: "अभी",
    };

    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  // Social: Share Post / News
  const handleShare = (titleText, url) => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: titleText || "Swar Media Citizen Journalism",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // Editorial CMS News Submission (Submit for Approval)
  const handleSubmitNewsReport = async (e) => {
    e.preventDefault();
    setArticleSuccessMsg("");
    setArticleErrorMsg("");

    if (!title.trim() || !content.trim() || !category) {
      setArticleErrorMsg("कृपया समाचार शीर्षक, विस्तृत विवरण एवं श्रेणी अवश्य भरें।");
      return;
    }

    setSubmittingArticle(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        location: district || "सुल्तानपुर",
        language: "hi",
        featuredImage: {
          url:
            imageUrl.trim() ||
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
          caption: sourceInfo.trim() || "ग्राउंड रिपोर्टर द्वारा प्रदत्त",
          alt: title.trim(),
        },
        status: "pending", // Citizen report goes to editorial review
      };

      const res = await apiFetch("/api/articles", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setArticleSuccessMsg(
          "आपकी खबर सफलतापूर्वक दर्ज हो गई है! संपादकीय टीम द्वारा समीक्षा के बाद यह मुख्य पोर्टल पर प्रकाशित की जाएगी।"
        );
        setTitle("");
        setContent("");
        setImageUrl("");
        setSourceInfo("");

        // Refresh user's article list
        if (user?._id) {
          loadMyArticles(user._id);
        }
      } else {
        setArticleErrorMsg(res.message || "खबर सबमिट करने में समस्या आई। पुनः प्रयास करें।");
      }
    } catch (err) {
      setArticleErrorMsg(err.message || "सर्वर से कनेक्ट नहीं हो सका।");
    } finally {
      setSubmittingArticle(false);
    }
  };

  // Helper to upload media file via multipart/form-data with robust client-side fallback
  const uploadMediaFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("image", file);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.url) {
        return data.url;
      }
    } catch (e) {
      console.warn("Server upload endpoint fallback:", e);
    }

    // Client-side fallback to compressed WebP data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.85));
        };
        img.onerror = () => resolve(loadEvt.target.result);
        img.src = loadEvt.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle News Article Image Upload
  const handleArticleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingArticleImage(true);
    setArticleErrorMsg("");
    try {
      const url = await uploadMediaFile(file);
      setImageUrl(url);
    } catch (err) {
      setArticleErrorMsg("फोटो अपलोड करने में त्रुटि आई: " + err.message);
    } finally {
      setUploadingArticleImage(false);
      if (articleImageInputRef.current) articleImageInputRef.current.value = "";
    }
  };

  // Handle Profile Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setProfileMsg("");
    try {
      const url = await uploadMediaFile(file);
      setProfileAvatar(url);

      // Auto-save to profile
      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profileName,
          district: profileDistrict,
          phone: profilePhone,
          bio: profileBio,
          avatar: url,
        }),
      });

      if (res.success && res.user) {
        setUser(res.user);
        if (refreshUser) refreshUser();
        setProfileMsg("प्रोफ़ाइल फोटो सफलतापूर्वक अपलोड व सहेज दी गई!");
        setTimeout(() => setProfileMsg(""), 3500);
      }
    } catch (err) {
      setProfileMsg("फोटो अपलोड करने में समस्या आई: " + err.message);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileMsg("");
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profileName,
          district: profileDistrict,
          phone: profilePhone,
          bio: profileBio,
          avatar: profileAvatar,
        }),
      });

      if (res.success && res.user) {
        setUser(res.user);
        if (refreshUser) refreshUser();
        setProfileMsg("प्रोफ़ाइल विवरण सफलतापूर्वक सहेज दिया गया!");
        setTimeout(() => setProfileMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileUpdating(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      setUser(null);
      await logout("/login");
    } catch (e) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-3">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          नागरिक पत्रकार पोर्टल लोड हो रहा है...
        </p>
      </div>
    );
  }

  // Calculated Stats
  const totalReportsCount = myArticles.length;
  const approvedReportsCount = myArticles.filter((a) => a.status === "published").length;
  const userScore = approvedReportsCount * 10 + 10;

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors w-full">
      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>लिंक कॉपी हो गया! आप इसे शेयर कर सकते हैं।</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN 3-PANEL LAYOUT CONTAINER (LEFT & RIGHT STICKY, CENTER SCROLLS) */}
      {/* ============================================================== */}
      <div className="w-full max-w-full px-2.5 sm:px-4 lg:px-6 xl:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start w-full">
          {/* ========================================================== */}
          {/* PANEL 1: LEFT SIDEBAR (STICKY ON DESKTOP)                  */}
          {/* ========================================================== */}
          <aside className="lg:col-span-3 lg:sticky lg:top-[105px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto no-scrollbar space-y-4 min-w-0 w-full shrink-0">
            {/* User Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                {/* Avatar with Camera Icon */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md border border-white/20 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name ? user.name.charAt(0).toUpperCase() : "K"}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab("profile")}
                    title="Change Avatar"
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center shadow hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-red-300" />
                  </button>
                </div>

                {/* Name & Badge */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {user?.name || "khushi"}
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "aggarwalkanika676@gmail.com"}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                    <span>🎖️</span>
                    <span>सत्यापित पत्रकार</span>
                  </div>
                </div>
              </div>

              {/* 4 Key Metric Tiles */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    ज़िला
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white truncate block">
                    {user?.district || district || "सुल्तानपुर"}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    कुल रिपोर्ट्स
                  </span>
                  <span className="font-extrabold text-red-600 dark:text-red-400 block">
                    {totalReportsCount} खबरें
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    स्वीकृत/प्रकाशित
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {approvedReportsCount}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    क्रेडिट स्कोर
                  </span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 block">
                    {userScore} अंक
                  </span>
                </div>
              </div>
            </div>

            {/* पत्रकार पैनल Navigation Menu */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                पत्रकार पैनल
              </div>

              {/* Tab 1: Community Feed */}
              <button
                type="button"
                onClick={() => setActiveTab("feed")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "feed"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/30 font-black"
                    : "text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800 dark:hover:text-red-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>कम्युनिटी फीड</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Tab 2: Submit News Report */}
              <button
                type="button"
                onClick={() => setActiveTab("submit")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "submit"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/30 font-black"
                    : "text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800 dark:hover:text-red-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>रिपोर्ट दर्ज करें</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Tab 3: My Reports & Status */}
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "reports"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/30 font-black"
                    : "text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800 dark:hover:text-red-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4" />
                  <span>मेरी खबरें व स्थिति</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === "reports"
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {totalReportsCount}
                </span>
              </button>

              {/* Tab 4: Profile Settings */}
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/30 font-black"
                    : "text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800 dark:hover:text-red-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>मेरी प्रोफाइल</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Direct Link: Today's e-Paper */}
              <Link
                href="/epaper"
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4 text-red-600" />
                  <span>दैनिक ई-पेपर</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>लॉगआउट</span>
                </div>
              </button>
            </div>
          </aside>

          {/* ========================================================== */}
          {/* PANEL 2: CENTER WORKSPACE (Interactive Feed / News CMS)    */}
          {/* ========================================================== */}
          <main className="lg:col-span-6 min-w-0 w-full space-y-4 pb-12">
            {/* TAB 1: COMMUNITY FEED */}
            {activeTab === "feed" && (
              <div className="space-y-4">
                {/* Quick Post Box */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "K"}
                    </div>
                    <textarea
                      rows={2}
                      value={quickPostText}
                      onChange={(e) => setQuickPostText(e.target.value)}
                      placeholder={`आपके मन में क्या विचार या ताज़ा अपडेट है, ${user?.name || "khushi"}?`}
                      className="w-full text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  {showImagePrompt && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <input
                        type="url"
                        value={quickPostImage}
                        onChange={(e) => setQuickPostImage(e.target.value)}
                        placeholder="फोटो का वेब लिंक (URL) डालें..."
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setShowImagePrompt(!showImagePrompt)}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Image className="w-3.5 h-3.5 text-blue-600" />
                        <span>फोटो जोड़ें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("submit")}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5 text-red-600" />
                        <span>वीडियो जोड़ें</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickPost}
                      disabled={quickPostLoading || !quickPostText.trim()}
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer ml-auto sm:ml-0"
                    >
                      {quickPostLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>पोस्ट करें</span>
                    </button>
                  </div>
                </div>

                {/* Feed of Community Posts */}
                <div className="space-y-4">
                  {communityPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3"
                    >
                      {/* Post Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                            {post.author.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                {post.author}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                {post.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-red-500" />
                                {post.district}
                              </span>
                              <span>•</span>
                              <span>{post.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-hindi">
                        {post.content}
                      </p>

                      {/* Attached Image if any */}
                      {post.image && (
                        <div className="rounded-xl overflow-hidden aspect-video bg-black/10">
                          <img
                            src={post.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Social Actions Bar (Like, Comment, Share) */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                            post.userLiked
                              ? "text-red-600 font-bold bg-red-50 dark:bg-red-950/40"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${post.userLiked ? "fill-red-600 text-red-600" : ""}`}
                          />
                          <span>{post.likes} पसंद</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCommentsPostId(
                              openCommentsPostId === post.id ? null : post.id
                            )
                          }
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>{post.comments?.length || 0} टिप्पणी</span>
                        </button>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => handleShare(post.content)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-red-600" />
                          <span>साझा करें</span>
                        </button>
                      </div>

                      {/* Comments Drawer / Input */}
                      {openCommentsPostId === post.id && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-2">
                              {post.comments.map((c) => (
                                <div
                                  key={c.id}
                                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    <span>{c.name}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      {c.time}
                                    </span>
                                  </div>
                                  <p className="text-slate-800 dark:text-slate-200">{c.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs({
                                  ...commentInputs,
                                  [post.id]: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment(post.id);
                              }}
                              placeholder="अपनी टिप्पणी दर्ज करें..."
                              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FULL CITIZEN JOURNALIST CMS FORM (रिपोर्ट दर्ज करें) */}
            {activeTab === "submit" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span>ज़मीनी समाचार / रिपोर्ट दर्ज करें</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    आपकी खबर सबमिट होते ही संपादकीय समीक्षा (Editorial Review) में जाएगी। स्वीकृति के बाद यह स्वर मीडिया के मुख्य पोर्टल पर लाइव होगी।
                  </p>
                </div>

                {articleSuccessMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{articleSuccessMsg}</span>
                  </div>
                )}

                {articleErrorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{articleErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitNewsReport} className="space-y-4">
                  {/* Headline */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      समाचार शीर्षक (Headline) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="उदा. सुल्तानपुर: मुख्य मार्ग पर जलभराव से राहगीर परेशान, प्रशासन से त्वरित समाधान की मांग"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  {/* Category & District Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        श्रेणी (Category) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.nameHi || cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        ज़िला / स्थान (District / Location)
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="उदा. सुल्तानपुर, लखनऊ, वाराणसी"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* News Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      समाचार विस्तृत विवरण (Story Details) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="घटना, समस्या या विचार का पूरा विवरण यहां लिखें (क्या, कब, कहां, कैसे और किसने)..."
                      className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  {/* Photo & Media Upload Section */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-red-600" />
                        <span>समाचार फोटो / मीडिया अपलोड (Media Upload)</span>
                      </span>
                      {imageUrl && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> फोटो संलग्न है
                        </span>
                      )}
                    </label>

                    <input
                      type="file"
                      ref={articleImageInputRef}
                      accept="image/*"
                      onChange={handleArticleImageUpload}
                      className="hidden"
                      id="article-image-file"
                    />

                    {imageUrl ? (
                      /* Preview of Uploaded Image */
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 flex items-center gap-3">
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative border border-slate-300 dark:border-slate-600">
                          <img
                            src={imageUrl}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            फोटो सफलतापूर्वक अपलोड हो गई है
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                            ✓ वेब कंप्रेस्ड एवं तैयार ({imageUrl})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <label
                            htmlFor="article-image-file"
                            className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-600 cursor-pointer transition-colors"
                          >
                            बदलें
                          </label>
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                            title="फोटो हटाएं"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Direct Media File Upload Dropzone */
                      <div
                        onClick={() => articleImageInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-colors bg-slate-50/60 dark:bg-slate-800/40 group"
                      >
                        {uploadingArticleImage ? (
                          <div className="flex flex-col items-center justify-center py-2 space-y-2">
                            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              फोटो अपलोड व कंप्रेस हो रही है...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-1.5">
                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              यहाँ क्लिक करके गैलरी या कैमरे से फोटो अपलोड करें (Media Upload)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              सपोर्टेड: JPG, PNG, WEBP, GIF (ऑटोमेटिक वेब कंप्रेस्ड)
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optional URL Toggle & Source Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            स्रोत / साक्ष्य (Source Details)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowManualUrl(!showManualUrl)}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                          >
                            {showManualUrl ? "वेब लिंक छुपाएं" : "अथवा वेब लिंक दर्ज करें"}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={sourceInfo}
                          onChange={(e) => setSourceInfo(e.target.value)}
                          placeholder="प्रत्यक्षदर्शी, ग्राम प्रधान, या आधिकारिक बयान"
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      {showManualUrl && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            फोटो का वेब लिंक (Image URL)
                          </label>
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      सबमिट होने के बाद स्थिति <b>'मेरी खबरें'</b> टैब में दिखेगी।
                    </p>
                    <button
                      type="submit"
                      disabled={submittingArticle}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-red-700 to-blue-800 hover:from-red-700 hover:to-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {submittingArticle ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>संपादकीय स्वीकृति हेतु भेजें</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: MY SUBMITTED NEWS & APPROVAL STATUS (मेरी खबरें व स्थिति) */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      मेरी दर्ज खबरें एवं स्थिति
                    </h2>
                    <p className="text-xs text-slate-500">
                      यहां आपकी सभी ग्राउंड रिपोर्ट की संपादकीय समीक्षा स्थिति (Status) दिखाई देती है।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("submit")}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>नई खबर दर्ज करें</span>
                  </button>
                </div>

                {myArticles.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      आपने अभी तक कोई खबर दर्ज नहीं की है
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      अपने क्षेत्र की कोई जनसमस्या, सकारात्मक पहल या ताज़ा ग्राउंड रिपोर्ट दर्ज करने के लिए नीचे क्लिक करें।
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("submit")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      पहली ग्राउंड रिपोर्ट लिखें
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myArticles.map((art) => (
                      <div
                        key={art._id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              {art.status === "published" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>स्वीकृत एवं प्रकाशित (LIVE)</span>
                                </span>
                              ) : art.status === "pending" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                  <Clock className="w-3 h-3 animate-spin" />
                                  <span>संपादकीय समीक्षाधीन (प्रतीक्षारत)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  <span>ड्राफ्ट</span>
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {new Date(art.createdAt).toLocaleDateString("hi-IN")}
                              </span>
                            </div>

                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              {art.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {art.excerpt || art.content}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                          <div className="flex items-center gap-3">
                            <span>श्रेणी: {art.category?.nameHi || art.category?.name || "सामान्य"}</span>
                            <span>•</span>
                            <span>स्थान: {art.location || "सुल्तानपुर"}</span>
                          </div>

                          {art.status === "published" && (
                            <Link
                              href={`/${art.category?.slug || "news"}/${art.slug}`}
                              className="text-red-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>पोर्टल पर देखें</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PROFILE SETTINGS (मेरी प्रोफाइल) */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    पत्रकार प्रोफाइल विवरण
                  </h2>
                  <p className="text-xs text-slate-500">
                    अपना नाम, ज़िला और परिचय अपडेट करें ताकि आपकी रिपोर्ट में सही पहचान प्रदर्शित हो।
                  </p>
                </div>

                {profileMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 rounded-xl text-xs font-bold">
                    {profileMsg}
                  </div>
                )}

                {/* Profile Avatar Upload Section */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Avatar Preview */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white dark:border-slate-800 overflow-hidden">
                      {profileAvatar ? (
                        <img
                          src={profileAvatar}
                          alt={profileName || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{profileName ? profileName.charAt(0).toUpperCase() : "K"}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      title="फोटो बदलें"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        पत्रकार प्रोफ़ाइल फोटो (Profile Picture)
                      </h3>
                      {profileAvatar && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" /> सक्रिय फोटो
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      सीधे गैलरी या कैमरे से अपनी फोटो अपलोड करें (Media Upload)।
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                      <input
                        type="file"
                        ref={avatarInputRef}
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-file-input"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingAvatar ? "अपलोड हो रहा है..." : "फोटो अपलोड करें (Media Upload)"}</span>
                      </button>

                      {profileAvatar && (
                        <button
                          type="button"
                          onClick={() => setProfileAvatar("")}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          हटाएं
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      पूरा नाम
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        गृह ज़िला / कार्यक्षेत्र
                      </label>
                      <input
                        type="text"
                        value={profileDistrict}
                        onChange={(e) => setProfileDistrict(e.target.value)}
                        placeholder="उदा. सुल्तानपुर, लखनऊ"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        मोबाइल नंबर (गोपनीय)
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      संक्षिप्त परिचय (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="आप किस तरह के मुद्दों पर लिखते हैं..."
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileUpdating}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      {profileUpdating ? "सहेज रहा है..." : "प्रोफाइल सहेजें"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>

          {/* ========================================================== */}
          {/* PANEL 3: RIGHT SIDEBAR (STICKY ON DESKTOP)                 */}
          {/* ========================================================== */}
          <aside className="lg:col-span-3 lg:sticky lg:top-[105px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto no-scrollbar space-y-4 min-w-0 w-full shrink-0">
            {/* 1. Sponsored Ad (Styled with Red/Blue/White) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>प्रायोजित (SPONSORED)</span>
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-bold">AD</span>
              </div>
              <div className="relative aspect-[4/3] bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80"
                  alt="Experience The Magic Of Bhutan"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                  Book Now 25% Off
                </span>
              </div>
              <div className="p-3 space-y-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                  Experience The Magic Of Bhutan
                </h4>
                <p className="text-[10px] text-slate-500 leading-tight">
                  From serene monasteries to sacred peaks. Luxury stays, flights, guided tours & visa assistance included.
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Swar Media Promotion Desk");
                  }}
                  className="block w-full py-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl text-center text-xs font-bold transition-colors shadow-xs"
                >
                  Enquire Now
                </a>
              </div>
            </div>

            {/* 2. Trending Ground Topics (LIVE) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-red-600 text-xs">⭐</span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    ट्रेंडिंग ग्राउंड मुद्दे
                  </h3>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 bg-red-600 text-white rounded-full">
                  LIVE
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: "#सुल्तानपुर_जलभराव", q: "सुल्तानपुर" },
                  { tag: "#लखनऊ_एक्सप्रेसवे", q: "लखनऊ" },
                  { tag: "#किसान_एमएसपी", q: "किसान" },
                  { tag: "#स्वास्थ्य_मिशन", q: "स्वास्थ्य" },
                  { tag: "#स्मार्ट_सिटी", q: "स्मार्ट सिटी" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/search?q=${encodeURIComponent(item.q)}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                  >
                    {item.tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Editorial Code & Guidelines (संपादकीय आचार संहिता) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  संपादकीय आचार संहिता
                </h3>
              </div>

              <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>प्रत्येक रिपोर्ट में प्रत्यक्ष साक्ष्य और सटीक स्थान का उल्लेख करें।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>संपादकीय टीम द्वारा स्वीकृत होते ही खबर पोर्टल पर लाइव होगी।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>फेक न्यूज़ या भ्रामक जानकारी पाए जाने पर आईडी ब्लॉक की जा सकती है।</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


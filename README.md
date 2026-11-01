# 🎙️ Swar Media (स्वर मीडिया) - Production-Ready Hindi & English News Portal with Full Admin CMS

A high-performance, bilingual digital news platform and complete content management system (CMS), inspired by the layout, user experience, and visual standards of top Indian news networks like **Aaj Tak**.

Built with an original brand identity: **"सत्य, सुर और सरोकार | Voice of Truth & Integrity"**.

---

## 🌟 Key Features

### 📰 Public News Portal (Aaj Tak Style)
- **Top Utility Bar:** Real-time Indian date, Sensex/Nifty live snapshot, Hindi/English language toggle, Dark Mode toggle, and quick editorial portal link.
- **Breaking News Marquee (बड़ी खबर):** High-contrast red/gold ticker strip with live pulsing alert badge and continuous smooth marquee scrolling managed from the Admin CMS.
- **Hero Lead Section:** 1 big lead story with hero imagery, badges, and read counts, accompanied by 4 side stories.
- **Top Stories Grid (बड़ी खबरें):** High-impact multi-card layout with category color-coded pills.
- **Category-wise News Desks:** Politics (राजनीति), India (देश), World (दुनिया), Sports (खेल), Entertainment (मनोरंजन), Business (बिज़नेस), and Tech (तकनीक).
- **Viral Trending Sidebar:** Most-read ranking widget (1 to 5) with view metrics and sponsored ad placements.
- **Video Hub (वीडियो बुलेटिन):** YouTube and embed video stories with duration timestamps and video player cards.
- **Photo Galleries (फोटो गैलरी):** Multi-photo visual essays with full-screen slide viewer and photo counts.
- **Live Coverage Feeds (लाइव ब्लॉग):** Minute-by-minute live reporting timeline with 15-second background auto-polling.
- **Interactive Article Detail Page:** High-resolution featured media, rich HTML prose typography, estimated reading time, author byline, WhatsApp/X/Facebook share buttons, view counter, related articles, in-article ad slot, and moderated reader comments.
- **Bilingual Interface:** Instant seamless 1-click toggle between Hindi (हिन्दी) and English, persisted locally.
- **SEO & Google News Ready:** Dynamic Open Graph, Twitter Cards, JSON-LD `NewsArticle` & `NewsMediaOrganization` schema, `sitemap.xml`, `news-sitemap.xml`, and `robots.txt`.

### 🛡️ Admin CMS (`/admin`)
- **Role-Based Access Control (RBAC):**
  - **Super Admin:** Complete authority across all CMS modules, user accounts, and system settings.
  - **Editor:** Story approvals, article publishing, comment moderation, category & ad configurations.
  - **Reporter:** Write and submit stories, drafts, and media for editorial review.
- **Editorial Dashboard:** Real-time KPI metrics (Total Stories, Readership Views, Today's Posts, Drafts, Pending Comments, Subscribers) and interactive Recharts velocity graphs.
- **Article Manager:**
  - Create, edit, soft-delete (trash), restore, and permanently delete stories.
  - Rich Text visual editor with HTML code mode and live preview.
  - Featured image uploader + image caption and alt tags.
  - Categorization, sub-categories, and tags selector.
  - Status management: Draft, Pending Review, Published, and Scheduled Date/Time publication.
  - Editorial Badges: Breaking News, Top Lead Story, Featured, and Trending sidebar flags.
  - SEO fields: Meta Title, Meta Description, Keywords, and automatic unique Unicode/Hindi slug generation.
  - Bulk actions: Publish, Move to Trash, Restore, and Permanent Delete.
- **Breaking News Ticker Manager:** Add/edit breaking tickers, set priority order, and toggle active status on the ticker marquee strip.
- **Homepage Manager:** Drag & drop / re-order lead hero story and side stories.
- **Categories & Tags:** Full CRUD, menu visibility toggle, and custom theme colors.
- **Video & Photo Galleries:** Embed YouTube videos with duration, multi-image photo gallery albums with slide captions.
- **Live Blogs Manager:** Start live blogs and broadcast instant timestamped entries to readers.
- **Comments Moderation:** Review pending comments, approve, reject, flag spam, or delete.
- **Advertisement Manager:** Header leaderboards (728x90), sidebar (300x250), in-article banners, custom script tags, impression counters, and click tracking.
- **Static Pages:** CRUD for About Us, Contact, Privacy Policy, Terms of Service, and Advertise.
- **Media Library:** Upload images directly to `/public/uploads` (or Cloudinary), browse assets, copy URLs to clipboard, and delete.
- **Users & Authors:** Manage staff profiles, author photos, bios in Hindi/English, and change passwords.
- **Newsletter Subscribers:** View subscribed readers and export entire subscriber base as CSV.
- **Site Settings:** Edit brand name, logo, favicon, contact details, social channels, footer copyright, and Google Analytics ID.
- **Activity & Security Audit Logs:** Immutable chronological record of newsroom edits, logins, and deletions.

---

## 💻 Tech Stack
- **Frontend:** Next.js 14+ (App Router)
- **Backend Server:** Express.js running as custom server inside `server.js` (mounted under `/api/*`)
- **Database:** MongoDB with Mongoose (with automated embedded MongoDB Memory Server fallback for local zero-config testing)
- **Styling:** Tailwind CSS + Noto Sans Devanagari & Inter typography
- **Authentication:** JWT stored in HTTP-Only Cookies + bcrypt password hashing
- **File Uploads:** Multer with local `/public/uploads` storage and optional Cloudinary integration
- **Schedulers:** node-cron for automatic publishing of scheduled articles

---

## 🚀 Quick Start Guide

### 1. Installation
Clone or navigate to the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=3000
NODE_ENV=development
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# MongoDB URI (Atlas or local).
# If local MongoDB is not running, an embedded in-memory MongoDB will automatically start!
MONGODB_URI=mongodb://localhost:27017/bharat_varta

# JWT Secret
JWT_SECRET=bharat_varta_super_secure_jwt_secret_key_2026_x99

# Cloudinary (Optional - leaves /public/uploads local storage active if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Database Seeding (Default Admin & Sample Stories)
Populate the database with sample bilingual articles, categories, tickers, videos, and default accounts:
```bash
npm run seed
```

**Default Test Credentials:**
- **Super Admin:** `admin@bharatvarta.in` / `AdminPassword123!`
- **Editor:** `editor@bharatvarta.in` / `EditorPassword123!`
- **Reporter:** `reporter@bharatvarta.in` / `ReporterPassword123!`

*(Tip: The `/admin/login` page also includes 1-click login buttons for instant testing!)*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Public Portal:** `http://localhost:3000`
- **Admin CMS:** `http://localhost:3000/admin`
- **REST APIs:** `http://localhost:3000/api/*`

---

## 🌐 Production Deployment Guide

### Deploying on a VPS (Ubuntu / DigitalOcean / AWS EC2)
1. Install Node.js 18+ and PM2:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm
   sudo npm install -g pm2
   ```
2. Clone repository & install dependencies:
   ```bash
   git clone <repo-url> /var/www/bharat-varta
   cd /var/www/bharat-varta
   npm install --production=false
   ```
3. Set production environment variables in `.env`:
   ```bash
   NODE_ENV=production
   PORT=3000
   SITE_URL=https://yourdomain.com
   MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster.mongodb.net/bharat_varta
   ```
4. Build Next.js production bundle:
   ```bash
   npm run build
   ```
5. Seed database (first time setup):
   ```bash
   npm run seed
   ```
6. Start with PM2 process manager:
   ```bash
   pm2 start server.js --name "bharat-varta"
   pm2 save
   pm2 startup
   ```
7. Configure Nginx reverse proxy to port `3000` with SSL via Let's Encrypt Certbot.

### Deploying on Render / Railway
1. Set Build Command:
   ```bash
   npm install && npm run build
   ```
2. Set Start Command:
   ```bash
   NODE_ENV=production node server.js
   ```
3. Set Environment variables (`MONGODB_URI`, `JWT_SECRET`, `SITE_URL`).

---

## 📄 License
MIT License. Built for high-volume bilingual news publishing.

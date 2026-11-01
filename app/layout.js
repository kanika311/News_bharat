import "./globals.css";
import PublicLayoutWrapper from "@/components/public/PublicLayoutWrapper";

export const metadata = {
  title: {
    default: "Swar Media | स्वर मीडिया - Hindi & English Latest News",
    template: "%s | Swar Media",
  },
  description:
    "Swar Media is India's premier bilingual news portal delivering breaking news, in-depth politics, sports, business, and entertainment stories with truth and courage.",
  keywords: [
    "Swar Media",
    "स्वर मीडिया",
    "Hindi News",
    "ताज़ा खबर",
    "Breaking News",
    "Indian Politics",
    "Cricket",
    "Business News",
    "Aaj Tak layout",
  ],
  authors: [{ name: "Swar Media Editorial Board" }],
  creator: "Swar Media",
  publisher: "Swar Media Network",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Swar Media | स्वर मीडिया - Truth & Integrity",
    description: "Leading bilingual news portal covering national and international affairs.",
    url: "/",
    siteName: "Swar Media",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 675,
        alt: "Swar Media",
      },
    ],
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swar Media | स्वर मीडिया",
    description: "Leading bilingual news portal covering national and international affairs.",
    images: ["/logo.png"],
    creator: "@swarmedia",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap" />
        {/* NewsMediaOrganization JSON-LD schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "name": "Swar Media",
              "url": "http://localhost:3000",
              "logo": "http://localhost:3000/logo.png",
              "sameAs": [
                "https://facebook.com/swarmedia",
                "https://twitter.com/swarmedia",
                "https://youtube.com/swarmedia",
              ],
            }),
          }}
        />
      </head>
      <body>
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}

import "./globals.css";
import PublicLayoutWrapper from "@/components/public/PublicLayoutWrapper";

export const metadata = {
  title: {
    default: "Bharat Varta | भारत वार्ता - Hindi & English Latest News",
    template: "%s | Bharat Varta",
  },
  description:
    "Bharat Varta is India's premier bilingual news portal delivering breaking news, in-depth politics, sports, business, and entertainment stories with truth and courage.",
  keywords: [
    "Bharat Varta",
    "Hindi News",
    "ताज़ा खबर",
    "Breaking News",
    "Indian Politics",
    "Cricket",
    "Business News",
    "Aaj Tak layout",
  ],
  authors: [{ name: "Bharat Varta Editorial Board" }],
  creator: "Bharat Varta Media",
  publisher: "Bharat Varta Media Network",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Bharat Varta | भारत वार्ता - Truth & Integrity",
    description: "Leading bilingual news portal covering national and international affairs.",
    url: "/",
    siteName: "Bharat Varta",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bharat Varta | भारत वार्ता",
    description: "Leading bilingual news portal covering national and international affairs.",
    creator: "@bharatvarta",
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
              "name": "Bharat Varta",
              "url": "http://localhost:3000",
              "logo": "http://localhost:3000/logo.png",
              "sameAs": [
                "https://facebook.com/bharatvarta",
                "https://twitter.com/bharatvarta",
                "https://youtube.com/bharatvarta",
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

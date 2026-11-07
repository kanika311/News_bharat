import "./globals.css";
import PublicLayoutWrapper from "@/components/public/PublicLayoutWrapper";

export const metadata = {
  title: {
    default: "The Swar Media | द स्वर मीडिया - सच के साथ, समाज के लिए",
    template: "%s | The Swar Media",
  },
  description:
    "The Swar Media - सच के साथ, समाज के लिए (Inform • Inspire • Empower). निष्पक्ष, विश्वसनीय और ज़मीनी पत्रकारिता का प्रमुख राष्ट्रीय डिजिटल न्यूज़ पोर्टल।",
  keywords: [
    "The Swar Media",
    "द स्वर मीडिया",
    "सच के साथ समाज के लिए",
    "Hindi News",
    "ताज़ा खबर",
    "Breaking News",
    "Indian Politics",
    "Cricket",
    "Business News",
  ],
  authors: [{ name: "The Swar Media Editorial Board" }],
  creator: "The Swar Media",
  publisher: "The Swar Media Network",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "The Swar Media | द स्वर मीडिया - सच के साथ, समाज के लिए",
    description: "Inform • Inspire • Empower - Leading bilingual news portal covering national and international affairs.",
    url: "/",
    siteName: "The Swar Media",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 675,
        alt: "The Swar Media",
      },
    ],
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Swar Media | द स्वर मीडिया",
    description: "सच के साथ, समाज के लिए (Inform • Inspire • Empower)",
    images: ["/logo.png"],
    creator: "@theswarmedia",
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

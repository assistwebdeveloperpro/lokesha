import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { RecentSearchesSync } from "@/components/landing/recent-searches/RecentSearchesSync";
import { SeenHistorySync } from "@/components/landing/seen-properties/SeenHistorySync";
import { ToastProvider } from "@/components/shared/ui/ToastProvider";
import { DEFAULT_OG_IMAGE_PATH, SITE_DESCRIPTION } from "@/lib/seo/pageMetadata";
import { SITE_NAME, SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Lokesha",
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Lokesha",
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokesha",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <ToastProvider>
          <SeenHistorySync />
          <RecentSearchesSync />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

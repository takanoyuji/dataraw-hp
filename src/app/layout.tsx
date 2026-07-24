import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GA4 } from "@/components/shared/ga4";
import "./globals.css";

// CJK フォントは subset が巨大なため preload せず、CSS 変数経由で適用する
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "DataRaw LLC",
    template: "%s | DataRaw LLC",
  },
  description: "データサイエンスとAIの専門家集団。経営に、再現性を。勘や経験に頼りがちな意思決定に、データで根拠をもたらします。",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} antialiased`}>
      <head>
        <GA4 />
      </head>
      <body className="min-h-screen bg-black text-white font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          本文へスキップ
        </a>
        <Navbar />
        <main id="main" className="pt-16">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

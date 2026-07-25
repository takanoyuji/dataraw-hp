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

const SITE_NAME = "DataRaw LLC";
const SITE_URL = "https://dataraw.jp";
const SITE_DESCRIPTION =
  "データサイエンスとAIの専門家集団。経営に、再現性を。勘や経験に頼りがちな意思決定に、データで根拠をもたらします。";

export const metadata: Metadata = {
  // OGP画像などの相対URLを絶対URLに解決するための基点。未設定だとビルドが落ちる
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
  // 画像自体は opengraph-image.tsx（ファイル規約）が自動で差し込むため
  // ここでは images を指定しない。指定するとそちらが優先されてしまう。
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: "@takano_yuji_ds",
    creator: "@takano_yuji_ds",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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

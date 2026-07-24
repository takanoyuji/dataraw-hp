import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 はネイティブモジュールのためバンドルせず外部依存として扱う
  serverExternalPackages: ["better-sqlite3"],
  // 開発時に左下へ出る Next.js のルートインジケーター（Nマーク）を非表示にする
  devIndicators: false,
};

export default nextConfig;

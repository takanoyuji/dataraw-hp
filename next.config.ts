import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 はネイティブモジュールのためバンドルせず外部依存として扱う
  serverExternalPackages: ["better-sqlite3"],
  // 開発時に左下へ出る Next.js のルートインジケーター（Nマーク）を非表示にする
  devIndicators: false,
  // 新人しごとシミュレーター: LP と無料版ゲームは単体のHTML（public/shinjin-sim/）。ディレクトリのURLで返す
  async rewrites() {
    return [
      { source: "/shinjin-sim", destination: "/shinjin-sim/index.html" },
      { source: "/shinjin-sim/play", destination: "/shinjin-sim/play/index.html" },
    ];
  },
};

export default nextConfig;

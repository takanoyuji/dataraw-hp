import type { Metadata } from "next";
import Link from "next/link";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";

export const metadata: Metadata = {
  title: "代表プロフィール",
};

const timeline = [
  {
    year: "2009年4月",
    title: "筑波大学 理工学群",
    subtitle: "筑波大学大学院 システム情報工学研究科",
    items: [
      "ネットワーク理論による購買プロセスの研究",
      "全部直接原価計算の実用化に関する研究",
    ],
  },
  {
    year: "2015年7月",
    title: "アクセンチュア",
    items: [
      "POSデータを用いた需要予測",
      "画像解析による商品分類",
    ],
  },
  {
    year: "2017年5月",
    title: "ベイカレントコンサルティング",
    items: [
      "DM送付先決定モデルの開発/検証",
      "アクセスログを用いた施策立案",
    ],
  },
  {
    year: "2020年4月〜現在",
    title: "合同会社データロー",
    items: [
      "解約率予測に基づく営業の業務プロセス改善",
      "商談データを用いたアプセル施策検討・推進",
      "集客数予測モデルを活用した飲食業プラットフォーム向け営業支援",
    ],
    subSections: [
      {
        title: "男装BLコンカフェ 星狼（東京池袋店・大阪日本橋店）",
        desc: "男装BLコンセプトカフェの運営",
      },
      {
        title: "シーシャバー Exhale",
        desc: "シーシャバーの運営",
        href: "https://shisha-exhale.com/",
      },
    ],
  },
  {
    year: "2024年1月〜現在",
    title: "株式会社リズム",
    items: [],
    subSections: [
      {
        title: "Dance Cover Lab運営",
        href: "https://dancecoverlab.com/",
      },
      {
        title: "Dance Studio Lab開発",
        href: "https://dance-studio-lab.com/",
      },
    ],
  },
  {
    year: "2024年2月〜現在",
    title: "Voice株式会社",
    items: [],
    subSections: [
      {
        title: "VTuberと飲めるコンカフェ VLiver Lab 大阪京橋店・東京池袋設立",
        href: "https://twitter.com/VLiverLab",
      },
    ],
  },
];

export default function CeoPage() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <SectionHeader title="代表プロフィール" />
        </ScrollAnimation>

        {/* Profile card */}
        <ScrollAnimation delay={100}>
          <div className="glass-card p-8 mb-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
              CEO
            </div>
            <h2 className="text-2xl font-bold mb-4">高野 悠司</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              筑波大学・大学院で理論統計、会計工学を研究した後、アクセンチュアに入社。
              ベイカレントコンサルティングへの転職後、データサイエンティストとして独立。
              フリーランスとしての経験を元に合同会社データローを創業。
            </p>
            <div className="mt-4">
              <a
                href="https://twitter.com/takano_yuji_ds"
                className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @takano_yuji_ds
              </a>
            </div>
          </div>
        </ScrollAnimation>

        {/* Timeline */}
        <ScrollAnimation delay={200}>
          <h3 className="text-2xl font-bold mb-8 gradient-text">経歴</h3>
        </ScrollAnimation>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600" />

          <div className="space-y-10">
            {timeline.map((entry, i) => (
              <ScrollAnimation key={entry.year} delay={300 + i * 100}>
                <div className="relative pl-12 md:pl-20">
                  {/* Dot */}
                  <div className="absolute left-2 md:left-6 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-4 border-black" />

                  <div className="glass-card p-6">
                    <span className="text-sm text-blue-400 font-medium">
                      {entry.year}
                    </span>
                    <h4 className="text-lg font-bold mt-1">{entry.title}</h4>
                    {"subtitle" in entry && entry.subtitle && (
                      <h4 className="text-lg font-bold text-gray-300">
                        {entry.subtitle}
                      </h4>
                    )}
                    {entry.items.length > 0 && (
                      <ul className="mt-3 space-y-1 text-gray-400 text-sm">
                        {entry.items.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    )}
                    {"subSections" in entry && entry.subSections && (
                      <div className="mt-3 space-y-2">
                        {entry.subSections.map((sub) => (
                          <div key={sub.title} className="pl-3 border-l-2 border-white/10">
                            {sub.href ? (
                              <a
                                href={sub.href}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {sub.title}
                              </a>
                            ) : (
                              <span className="text-sm font-medium">
                                {sub.title}
                              </span>
                            )}
                            {"desc" in sub && sub.desc && (
                              <p className="text-gray-400 text-sm">{sub.desc}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full gradient-btn text-white font-medium"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

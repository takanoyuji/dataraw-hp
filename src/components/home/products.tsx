import { ArrowRight, ArrowUpRight, Gamepad2, Sparkles } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";

/**
 * 自社で作って運用しているサービス（2026-10-30〜 実績例の下にまとめて出す）。
 * 新人しごとシミュレーターは public/shinjin-sim の単体HTML、OSHI+ は oshiplus.net の別サイトなので next/link を使わない。
 * OSHI+ は星狼の名前・男装カフェの運営を出さない方針（knowledge/自社/新規事業/OSHI+のLPと研修シミュレーター.md）。ここでも店名は書かない
 */
const groups = [
  {
    icon: Gamepad2,
    audience: "企業の新人研修向け",
    name: "新人しごとシミュレーター",
    lead: "報連相、確認、断り方、頼み方。上司の無茶ぶりにどう返すかを、1話5分のゲームでくり返す新人研修。",
    accent: "from-orange-400 to-amber-400",
    items: [
      {
        title: "法人プラン",
        desc: "貴社のルールで作る専用の10話と、受講状況を見られる管理画面。5人・2週間の無料トライアルあり。",
        href: "/shinjin-sim",
        external: false,
      },
      {
        title: "無料版",
        desc: "共通の10話を、登録なし・スマホのブラウザで遊べる。",
        href: "/shinjin-sim/play",
        external: false,
      },
    ],
  },
  {
    icon: Sparkles,
    audience: "コンカフェ・メイド喫茶向け",
    name: "OSHI+（オシプラ）",
    lead: "自社のお店で使ってきた仕組みを、コンカフェ向けにまとめたサービス。",
    accent: "from-pink-500 to-fuchsia-500",
    items: [
      {
        title: "OSHI+ SITE",
        desc: "席予約・遠隔ドリンク・会員とランキングまで入った、コンカフェ専用の公式サイト。",
        href: "https://oshiplus.net/site/",
        external: true,
      },
      {
        title: "OSHI+ TRAINING",
        desc: "お店のルールで作る接客練習ゲーム。キャストのスマホで何度でも練習できる。",
        href: "https://oshiplus.net/training/",
        external: true,
      },
      {
        title: "コンカフェ痛客シミュレーター",
        desc: "困ったお客さまに、様子を読んで対応する無料のミニゲーム。",
        href: "https://oshiplus.net/game/",
        external: true,
      },
    ],
  },
];

export function Products() {
  return (
    <section id="products" className="py-24 section-darker relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader title="サービス" subtitle="自社で作り、運用しているサービスです。" />
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {groups.map((g, i) => (
            <ScrollAnimation key={g.name} delay={i * 120}>
              <div className="glass-card p-6 md:p-8 h-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${g.accent} opacity-60`} />
                <p className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <g.icon className="h-4 w-4" />
                  {g.audience}
                </p>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{g.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 [word-break:auto-phrase]">{g.lead}</p>

                <ul className="divide-y divide-white/10 border-t border-white/10">
                  {g.items.map((it) => (
                    <li key={it.title}>
                      <a
                        href={it.href}
                        {...(it.external ? { target: "_blank", rel: "noopener" } : {})}
                        className="group flex items-start gap-4 py-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white group-hover:underline underline-offset-4">{it.title}</div>
                          <p className="text-gray-400 text-sm leading-relaxed mt-1 [word-break:auto-phrase]">{it.desc}</p>
                        </div>
                        {it.external ? (
                          <ArrowUpRight className="h-4 w-4 mt-1 shrink-0 text-gray-500 group-hover:text-white transition-colors" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-gray-500 group-hover:text-white transition-colors" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

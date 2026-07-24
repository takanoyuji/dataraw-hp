import { TrendingDown, TrendingUp, Store } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";

const cases = [
  {
    icon: TrendingDown,
    metric: "5%",
    metricLabel: "解約率削減",
    title: "解約予測による営業最適化",
    description:
      "機械学習を活用した解約予測モデルにより、営業行動を最適化。リスクの高い顧客へ優先対応することで解約率が5%削減。",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    metric: "6%",
    metricLabel: "売上向上",
    title: "レコメンドエンジンの構築",
    description:
      "協調フィルタリングでユーザの嗜好に合った商品をレコメンドする仕組みを構築し、売上が6%向上。",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Store,
    metric: "2,000万",
    metricLabel: "月商実績",
    title: "データドリブン店舗経営",
    description:
      "データに基づく経営により自社店舗では月商2000万円・月利益400万円を維持。SNS集客からLP開発まで自社実践。",
    color: "from-amber-500 to-orange-500",
  },
];

export function Cases() {
  return (
    <section id="cases" className="py-24 section-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/3 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader title="実績例" />
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <ScrollAnimation key={c.title} delay={i * 120}>
              <div className="glass-card p-6 h-full group hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${c.color} opacity-50`} />

                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center opacity-80`}>
                    <c.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>
                      {c.metric}
                    </div>
                    <div className="text-xs text-gray-500">{c.metricLabel}</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-3">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

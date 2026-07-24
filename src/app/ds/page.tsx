import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Brain, Bot, Database } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";

export const metadata: Metadata = {
  title: "データサイエンス事業",
};

const services = [
  {
    icon: BarChart3,
    title: "データ利活用のコンサルティング",
    desc: "ビジネス課題に合わせたデータ活用戦略の立案から、実装までをサポート",
  },
  {
    icon: Brain,
    title: "機械学習・予測モデルの構築",
    desc: "業務データを活用した予測モデルの開発と実装を支援",
  },
  {
    icon: Bot,
    title: "AI活用支援",
    desc: "業務効率化や自動化のためのAIソリューションを提案・実装",
  },
  {
    icon: Database,
    title: "データ分析基盤の設計・構築",
    desc: "スケーラブルなデータ分析環境の構築と運用をサポート",
  },
];

const caseStudies = [
  {
    company: "大手メディア企業様",
    highlight: "年間約20億円の売上向上",
    desc: "購買データをもとに「購入期待値」を予測するモデルを開発。期待値の高い商品を上位表示する仕組みを構築し、売上向上に貢献。",
  },
  {
    company: "大手営業会社様",
    highlight: "解約率の低下と営業効率の向上",
    desc: "顧客の解約リスクを予測するモデルを構築。リスクの高い顧客に優先対応する営業戦略を実現。",
  },
  {
    company: "リユース事業者様",
    highlight: "在庫リスクの最小化",
    desc: "価格変動リスクを可視化する分析基盤を構築。将来の価格予測に基づいて現在の仕入価格を逆算できるツールを提供。",
  },
];

export default function DsPage() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            データサイエンス事業
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            AI・機械学習をビジネスに活かすパートナーとして、データ活用を支援します
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#contact"
              className="px-8 py-4 rounded-full gradient-btn text-white font-medium text-lg shadow-lg shadow-blue-500/25"
            >
              無料相談はこちら
            </Link>
            <a
              href="https://lin.ee/891lkrhv"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-all font-medium text-lg"
            >
              LINEで相談する
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="提供サービス" />
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <ScrollAnimation key={s.title} delay={i * 100}>
                <GlassCard className="h-full">
                  <s.icon className="h-10 w-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-400">{s.desc}</p>
                </GlassCard>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 section-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="導入事例" />
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((c, i) => (
              <ScrollAnimation key={c.company} delay={i * 100}>
                <GlassCard className="h-full">
                  <h3 className="text-lg font-bold mb-2">{c.company}</h3>
                  <p className="text-blue-400 font-semibold mb-3 text-sm">
                    {c.highlight}
                  </p>
                  <p className="text-gray-400 text-sm">{c.desc}</p>
                </GlassCard>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 section-dark">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollAnimation>
            <SectionHeader title="データ活用のご相談はこちらから" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="px-8 py-4 rounded-full gradient-btn text-white font-medium text-lg shadow-lg shadow-blue-500/25"
              >
                無料相談する
              </Link>
              <a
                href="https://lin.ee/891lkrhv"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-all font-medium text-lg"
              >
                LINEで今すぐ相談
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Zap, Shield, BarChart3 } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";

export const metadata: Metadata = {
  title: "Web開発事業",
};

const features = [
  {
    icon: DollarSign,
    title: "収益構造まで支援",
    desc: "外資系コンサルが事業設計まで支援",
  },
  {
    icon: Zap,
    title: "生成AIで低コスト開発",
    desc: "早く・安く・効果的に",
  },
  {
    icon: Shield,
    title: "SEO・セキュリティ対策",
    desc: "必要な対策を専門家が選定",
  },
  {
    icon: BarChart3,
    title: "アクセスログ解析",
    desc: "データサイエンティストが伴走",
  },
];

const portfolio = [
  {
    title: "Webアプリ（B2Cマッチングプラットフォーム）",
    desc: "UIUX設計・収益モデル構築・開発まで一気通貫で支援",
  },
  {
    title: "HP制作（飲食店｜12万円）",
    desc: "WordPressで最小コスト開発、写真撮影とCMS導入で運用まで視野に",
  },
  {
    title: "LP制作（30万円）",
    desc: "SNS広告戦略から企画、構成・コピー・実装まで。90%のコスト削減。",
  },
];

const pricing = [
  { plan: "LP制作", content: "広告用LP／構成〜実装まで", price: "5万円〜" },
  {
    plan: "HP制作",
    content: "写真撮影・CMS導入・SEO対策含む",
    price: "10万円〜",
  },
  {
    plan: "Webアプリ制作",
    content: "要件定義・UI設計・開発・ログ分析含む",
    price: "50万円〜",
  },
];

const faqs = [
  {
    q: "LPだけでも相談できますか？",
    a: "はい、LP単体のご相談も承っております。",
  },
  {
    q: "予算が少ないのですが相談可能ですか？",
    a: "ご予算に応じて最適なプランをご提案いたします。まずはお気軽にご相談ください。",
  },
  {
    q: "生成AIでの開発は品質に問題ありませんか？",
    a: "生成AIはあくまで開発効率化のツールとして使用し、品質は専門のエンジニアが担保します。",
  },
];

export default function LpPage() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            事業を伸ばす、戦略思考のWeb開発
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-300 mb-4">
            ビジネスに効くWeb開発を、圧倒的コスパで。
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            LP制作5万円〜。企画・開発・収益設計まで一気通貫でご支援。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#contact"
              className="px-8 py-4 rounded-full gradient-btn text-white font-medium text-lg shadow-lg shadow-blue-500/25"
            >
              無料相談はこちら
            </Link>
            <a
              href="https://line.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-all font-medium text-lg"
            >
              LINEで相談する
            </a>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 section-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="Web開発、こんなお悩みありませんか？" />
          </ScrollAnimation>
          <ScrollAnimation delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassCard hover={false}>
                <ul className="space-y-3 text-gray-300 text-lg">
                  <li>・制作費が高すぎる</li>
                  <li>・収益化できるか不安</li>
                  <li>・制作後の運用がわからない</li>
                </ul>
              </GlassCard>
              <GlassCard hover={false} className="border-blue-500/30">
                <h3 className="text-lg font-bold mb-3 gradient-text">解決方法</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>・生成AIでコストダウン</li>
                  <li>・収益モデルの設計も伴走</li>
                  <li>・SEO・セキュリティ・広告まで伴走支援</li>
                </ul>
              </GlassCard>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 section-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="サービスの特徴" />
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <ScrollAnimation key={f.title} delay={i * 100}>
                <GlassCard className="h-full text-center">
                  <f.icon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </GlassCard>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="実績紹介" />
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolio.map((p, i) => (
              <ScrollAnimation key={p.title} delay={i * 100}>
                <GlassCard className="h-full">
                  <h3 className="font-bold mb-3">{p.title}</h3>
                  <p className="text-gray-400 text-sm">{p.desc}</p>
                </GlassCard>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 section-darker">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="料金プラン" />
          </ScrollAnimation>
          <ScrollAnimation delay={100}>
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">プラン名</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">内容</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">価格</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pricing.map((p) => (
                    <tr key={p.plan}>
                      <td className="p-4 font-medium">{p.plan}</td>
                      <td className="p-4 text-gray-400 text-sm">{p.content}</td>
                      <td className="p-4 text-blue-400 font-bold">{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              ご予算・目的に応じて最適なプランをご提案します
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 section-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <SectionHeader title="よくある質問" />
          </ScrollAnimation>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollAnimation key={faq.q} delay={i * 100}>
                <GlassCard hover={false}>
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-gray-400 text-sm">{faq.a}</p>
                </GlassCard>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 section-darker">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollAnimation>
            <SectionHeader title="あなたの&quot;つくりたい&quot;を、ビジネス成果に変えます。" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="px-8 py-4 rounded-full gradient-btn text-white font-medium text-lg shadow-lg shadow-blue-500/25"
              >
                無料で相談する
              </Link>
              <a
                href="https://line.me/"
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

import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/section-header";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { GlassCard } from "@/components/shared/glass-card";

export const metadata: Metadata = {
  title: "会社概要",
};

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <SectionHeader title="会社概要" />
        </ScrollAnimation>

        <ScrollAnimation delay={100}>
          <GlassCard hover={false} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 gradient-text">About DataRaw LLC.</h2>
            <p className="text-gray-300 leading-relaxed">
              DataRaw LLC.は、データサイエンスとWeb開発を通じて、企業のデジタル変革を支援する会社です。
              私たちは、最新の技術とデータ分析を活用し、お客様のビジネス課題を解決します。
            </p>
          </GlassCard>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <GlassCard hover={false} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 gradient-text">事業内容</h2>
            <ul className="text-gray-300 space-y-3">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Webサイト・アプリケーション開発
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                データ分析・機械学習
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                コンセプトカフェ運営
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                デジタルマーケティング支援
              </li>
            </ul>
          </GlassCard>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <GlassCard hover={false} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 gradient-text">会社情報</h2>
            <table className="w-full text-gray-300">
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="py-3 pr-4 text-gray-400 w-32">会社名</td>
                  <td className="py-3">合同会社データロー</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-gray-400">所在地</td>
                  <td className="py-3">
                    〒160-0023<br />
                    東京都新宿区西新宿7-5-9 ファーストリアルタワー新宿2901
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-gray-400">代表者</td>
                  <td className="py-3">高野 悠司</td>
                </tr>
              </tbody>
            </table>
          </GlassCard>
        </ScrollAnimation>

        <ScrollAnimation delay={400}>
          <GlassCard hover={false}>
            <h2 className="text-2xl font-bold mb-4 gradient-text">お問い合わせ</h2>
            <p className="text-gray-300">
              詳しい情報やご相談については、お気軽にお問い合わせください。
            </p>
          </GlassCard>
        </ScrollAnimation>
      </div>
    </div>
  );
}

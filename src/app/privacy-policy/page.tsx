import type { Metadata } from "next";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <SectionHeader title="プライバシーポリシー" />
        </ScrollAnimation>

        <div className="space-y-8">
          <ScrollAnimation delay={100}>
            <GlassCard hover={false}>
              <h2 className="text-xl font-bold mb-3">1. 基本方針</h2>
              <p className="text-gray-300 leading-relaxed">
                DataRaw LLC（以下「当社」）は、個人情報の保護に関する法律、その他の関係法令を遵守し、適切な収集、利用、管理を行うことが社会的責務であると考え、個人情報の保護に努めます。
              </p>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation delay={150}>
            <GlassCard hover={false}>
              <h2 className="text-xl font-bold mb-3">2. 個人情報の収集・利用目的</h2>
              <p className="text-gray-300 mb-3">
                当社は、以下の目的のために必要な範囲で個人情報を収集・利用いたします：
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• サービスの提供・運営</li>
                <li>• お問い合わせへの対応</li>
                <li>• 採用活動</li>
                <li>• その他、当社の事業に関連する業務</li>
              </ul>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation delay={200}>
            <GlassCard hover={false}>
              <h2 className="text-xl font-bold mb-3">3. 個人情報の管理</h2>
              <p className="text-gray-300 leading-relaxed">
                当社は、個人情報の正確性及び安全性を確保するために、セキュリティ対策を実施し、個人情報の漏洩、滅失または毀損を防止します。
              </p>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation delay={250}>
            <GlassCard hover={false}>
              <h2 className="text-xl font-bold mb-3">4. 個人情報の第三者提供</h2>
              <p className="text-gray-300 mb-3">
                当社は、以下の場合を除き、個人情報を第三者に提供いたしません：
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• ご本人の同意がある場合</li>
                <li>• 法令に基づく場合</li>
                <li>• 人の生命、身体または財産の保護のために必要がある場合</li>
              </ul>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation delay={300}>
            <GlassCard hover={false}>
              <h2 className="text-xl font-bold mb-3">5. お問い合わせ</h2>
              <p className="text-gray-300 mb-3">
                当社の個人情報の取扱いに関するお問い合わせは、下記までご連絡ください：
              </p>
              <div className="text-gray-300">
                <p>DataRaw LLC</p>
                <p>〒160-0023</p>
                <p>東京都新宿区西新宿7-5-9 ファーストリアルタワー新宿2901</p>
              </div>
            </GlassCard>
          </ScrollAnimation>

          <ScrollAnimation delay={350}>
            <p className="text-center text-gray-500 text-sm">
              制定日：2025年1月1日
            </p>
          </ScrollAnimation>
        </div>
      </div>
    </div>
  );
}

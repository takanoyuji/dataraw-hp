import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SeriesContext } from "@/types/article";

/** 記事末尾の導線: 番外編の紹介 → 相談導線 → 著者ボックス */
export function ArticleClosing({ context }: { context: SeriesContext | null }) {
  const extras = context?.extras ?? [];

  return (
    <div className="mt-10 space-y-4">
      {extras.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 text-[0.92rem] text-gray-600">
          <div className="mb-3 font-bold text-[#1a2332]">あわせて読む</div>
          <ul className="space-y-2">
            {extras.map((extra) => (
              <li key={extra.slug}>
                <Link
                  href={`/articles/${extra.slug}`}
                  className="group inline-flex items-start gap-2 text-[#2563eb] transition-colors hover:text-blue-700"
                >
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span className="underline decoration-[#2563eb]/30 underline-offset-4">
                      {extra.shortTitle}
                    </span>
                    {extra.lead && (
                      <span className="block text-gray-500 no-underline">
                        {extra.lead}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-[#2563eb]/20 bg-[#eff6ff] px-6 py-6 text-[0.92rem] leading-[1.9] text-gray-700">
        <p className="mb-2 font-bold text-[#1a2332]">
          自社の業務でAIに何をどこまで任せられるか、一緒に切り分けます。
        </p>
        <p className="mb-4">
          データローは、データ活用のコンサルティングと、AIを組み込んだ業務設計・開発を行っています。
          記事で触れた「型」の設計に関心があれば、お気軽にご相談ください。
        </p>
        <Link
          href="/#contact"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          お問い合わせ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-6 text-[0.88rem] leading-[1.9] text-gray-600">
        <p className="mb-2 font-bold text-gray-900">合同会社データロー（東京）</p>
        <p>
          コンセプトカフェ等の店舗を複数運営しながら、データ活用のコンサルティングとWeb開発を行っている。
          自社の現場を検証環境として、AIを業務にどう組み込むかを試している。
        </p>
        <p className="mt-3 text-gray-500">
          <Link href="/about" className="hover:text-gray-700">
            会社概要
          </Link>
          <span className="mx-2">/</span>
          <Link href="/ceo" className="hover:text-gray-700">
            代表紹介
          </Link>
        </p>
      </div>
    </div>
  );
}

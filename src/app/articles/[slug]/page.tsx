import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { getArticleBySlug, getArticleSlugs } from "@/lib/articles";
import { getCategoryById } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { ArticleContent } from "@/components/articles/article-content";
import { ArticleTracker } from "@/components/articles/article-tracker";
import { ArticlePager } from "@/components/articles/article-pager";
import { ArticleClosing } from "@/components/articles/article-closing";
import { Comments } from "@/components/articles/comments";
import { getSeriesContext } from "@/lib/series";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  // 非公開記事は本文が404になるので、メタデータにもタイトルを出さない
  // （og:title は404ページのHTMLにも残るため、ここで塞ぐ必要がある）
  if (!article || !article.published) return { title: "記事が見つかりません" };

  // SNSのカードは1〜2行しか出ないので、説明文が長い記事は切り詰める
  const summary =
    article.description.length > 110
      ? `${article.description.slice(0, 110)}…`
      : article.description;

  return {
    title: article.title,
    description: article.description,
    // 画像は opengraph-image.tsx が記事ごとに生成したものが自動で入る
    openGraph: {
      // openGraph は親のものを置き換えるので、siteName/locale もここで指定し直す
      type: "article",
      siteName: "DataRaw LLC",
      locale: "ja_JP",
      url: `/articles/${slug}`,
      title: article.title,
      description: summary,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: summary,
    },
    alternates: {
      canonical: `/articles/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article || !article.published) notFound();

  const category = getCategoryById(article.category);
  const seriesContext = getSeriesContext(slug);

  return (
    <div className="pb-24">
      {/* 濃紺グラデのヘッダバンド（元HTMLの article-header 相当・ダーク） */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#1a2332] via-[#212d44] to-black pt-24 pb-24 md:pt-28">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <Link
              href="/articles"
              className="mb-8 inline-flex items-center gap-2 text-sm text-blue-200/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              記事一覧に戻る
            </Link>
          </ScrollAnimation>

          <ScrollAnimation delay={100}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {category && (
                <Badge className="border-0 bg-blue-500/25 text-blue-100">
                  {category.name}
                </Badge>
              )}
              {seriesContext && (
                <span className="rounded border border-blue-300/40 px-2.5 py-0.5 text-[0.7rem] font-bold tracking-[0.08em] text-blue-200">
                  連載 {seriesContext.label}
                </span>
              )}
            </div>
            {seriesContext ? (
              <>
                <h1 className="mb-3 text-xl font-bold leading-relaxed tracking-tight text-white md:text-[1.7rem] md:leading-[1.5]">
                  {seriesContext.seriesTitle}
                </h1>
                <p className="mb-6 text-lg font-semibold leading-relaxed text-blue-50 md:text-2xl md:leading-[1.5]">
                  <span className="mr-2 text-blue-300">
                    {seriesContext.positionLabel}
                  </span>
                  {/* 特集の本編は記事タイトルが特集名と同じことがある。
                      上の見出しと二重になるので、その場合はラベルだけ出す */}
                  {article.title ===
                  (seriesContext.series.titleBase ??
                    seriesContext.series.name)
                    ? null
                    : article.title}
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-4 text-2xl font-bold leading-relaxed tracking-tight text-white md:text-4xl md:leading-[1.4]">
                  {article.title}
                </h1>
                <p className="mb-6 text-base leading-relaxed text-blue-100/70 md:text-lg">
                  {article.description}
                </p>
              </>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200/50">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {article.publishedAt}
              </span>
              {article.updatedAt && (
                <span>更新: {article.updatedAt}</span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
            </div>
          </ScrollAnimation>
        </div>
      </header>

      {/* 白カード本文（元HTMLの article 相当・ライト）。ヘッダに少し重ねる */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimation delay={150}>
          <article className="-mt-12 rounded-2xl bg-[#fbfbfd] px-5 py-9 shadow-2xl shadow-black/40 ring-1 ring-black/5 md:px-12 md:py-14">
            <ArticleContent content={article.content} />

            {article.tags.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {article.tags.map((tag) => (
                    <Link key={tag} href={`/articles?tag=${tag}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer border-gray-300 text-gray-500 hover:border-[#2563eb] hover:text-[#2563eb]"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {seriesContext && <ArticlePager context={seriesContext} />}

            <ArticleClosing context={seriesContext} />

            {/* 記事末尾＝読了判定のセンチネル。表示/読了を自前計測 */}
            <ArticleTracker slug={slug} />
          </article>
        </ScrollAnimation>

        <Comments slug={slug} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArticleMetas, getAllTags } from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { SectionHeader } from "@/components/shared/section-header";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { ArticleCard } from "@/components/articles/article-card";
import { SeriesCard } from "@/components/articles/series-card";
import { ArticleFilters } from "@/components/articles/article-filters";
import { groupArticles } from "@/lib/series";

export const metadata: Metadata = {
  title: "ブログ",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  let articles = getAllArticleMetas();
  const categories = getCategories();
  const allTags = getAllTags();

  if (params.category) {
    articles = articles.filter((a) => a.category === params.category);
  }
  if (params.tag) {
    articles = articles.filter((a) => a.tags.includes(params.tag!));
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <SectionHeader
            title="ブログ"
            subtitle="データサイエンス、AI活用、Web開発に関する知見をお届けします"
          />
        </ScrollAnimation>

        <Suspense fallback={null}>
          <ArticleFilters categories={categories} allTags={allTags} />
        </Suspense>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupArticles(articles, { foldExtras: false }).map((item, i) =>
              item.type === "series" ? (
                <ScrollAnimation key={`series-${item.series.id}`} delay={i * 50}>
                  <SeriesCard
                    item={item}
                    categoryName={
                      categories.find((c) => c.id === item.representative.category)?.name
                    }
                  />
                </ScrollAnimation>
              ) : (
                <ScrollAnimation key={item.article.slug} delay={i * 50}>
                  <ArticleCard
                    article={item.article}
                    categoryName={categories.find((c) => c.id === item.article.category)?.name}
                  />
                </ScrollAnimation>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">記事が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}

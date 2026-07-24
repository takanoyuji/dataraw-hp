import Link from "next/link";
import { ArrowRight, Calendar, Layers } from "lucide-react";
import { getAllArticleMetas } from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { groupArticles } from "@/lib/series";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";

export function LatestArticles() {
  const items = groupArticles(getAllArticleMetas()).slice(0, 3);
  const categories = getCategories();

  if (items.length === 0) return null;

  return (
    <section className="py-24 section-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader
            title="最新の記事"
            subtitle="データサイエンス、AI活用、Web開発に関する知見をお届けします"
          />
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const isSeries = item.type === "series";
            const meta = isSeries ? item.representative : item.article;
            const cat = categories.find((c) => c.id === meta.category);
            const href = isSeries
              ? `/articles/${item.series.articles[0].slug}`
              : `/articles/${item.article.slug}`;
            const title = isSeries
              ? item.series.shortName ?? item.series.titleBase ?? item.series.name
              : item.article.title;
            const date = isSeries ? item.latestPublishedAt : item.article.publishedAt;
            const accent = isSeries ? "99,102,241" : null;
            return (
              <ScrollAnimation key={isSeries ? `series-${item.series.id}` : item.article.slug} delay={i * 120}>
                <Link href={href} className="block group h-full">
                  <div className="glass-card p-6 h-full flex flex-col group-hover:border-white/20 group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    {/* Top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px opacity-50"
                      style={{
                        background: accent
                          ? `linear-gradient(to right, rgba(${accent},0.8), transparent)`
                          : cat
                          ? `linear-gradient(to right, ${cat.color}80, transparent)`
                          : "linear-gradient(to right, rgba(99,102,241,0.5), transparent)",
                      }}
                    />

                    <div className="flex flex-wrap gap-2 mb-3">
                      {isSeries && (
                        <Badge className="border-0 text-xs bg-indigo-500/20 text-indigo-300 flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          連載・全{item.count}回
                        </Badge>
                      )}
                      {cat && (
                        <Badge
                          variant="secondary"
                          className="border-0 text-xs"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.name}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 flex-shrink-0">
                      {title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                      {meta.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {date}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSeries ? "連載を読む" : "続きを読む"}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollAnimation>
            );
          })}
        </div>

        <ScrollAnimation delay={400}>
          <div className="text-center mt-10">
            <Link
              href="/articles"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-300 text-sm font-medium"
            >
              すべての記事を見る
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

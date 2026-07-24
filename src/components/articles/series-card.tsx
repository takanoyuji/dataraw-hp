import Link from "next/link";
import { Calendar, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { ArticleListItem } from "@/types/article";

interface SeriesCardProps {
  item: Extract<ArticleListItem, { type: "series" }>;
  categoryName?: string;
}

export function SeriesCard({ item, categoryName }: SeriesCardProps) {
  const { series, representative: rep, count, latestPublishedAt } = item;
  const entrySlug = series.articles[0].slug;
  const title = series.shortName ?? series.titleBase ?? series.name;
  const badgeText =
    series.kind === "feature" ? `特集・全${count}記事` : `連載・全${count}回`;

  return (
    <Link href={`/articles/${entrySlug}`} className="block group">
      <GlassCard className="h-full">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-0 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {badgeText}
          </Badge>
          {categoryName && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-0">
              {categoryName}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{rep.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {latestPublishedAt}
          </span>
          <span className="text-indigo-300">第1回から読む →</span>
        </div>
      </GlassCard>
    </Link>
  );
}

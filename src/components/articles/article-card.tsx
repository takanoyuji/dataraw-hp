import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { ArticleMeta } from "@/types/article";

interface ArticleCardProps {
  article: ArticleMeta;
  categoryName?: string;
}

export function ArticleCard({ article, categoryName }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="block group">
      <GlassCard className="h-full">
        <div className="flex flex-wrap gap-2 mb-3">
          {categoryName && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-0">
              {categoryName}
            </Badge>
          )}
          {article.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-gray-400 border-white/10">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {article.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {article.publishedAt}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {article.author}
          </span>
        </div>
      </GlassCard>
    </Link>
  );
}

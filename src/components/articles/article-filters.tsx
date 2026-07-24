"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Category } from "@/types/article";

interface ArticleFiltersProps {
  categories: Category[];
  allTags: string[];
}

export function ArticleFilters({ categories, allTags }: ArticleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSearch = searchParams.get("q") || "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/articles?${params.toString()}`);
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="記事を検索..."
          defaultValue={currentSearch}
          onChange={(e) => updateParams("q", e.target.value)}
          className="pl-10 bg-white/5 border-white/10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!currentCategory ? "default" : "outline"}
          className={`cursor-pointer ${!currentCategory ? "gradient-btn text-white border-0" : "border-white/10 text-gray-400 hover:text-white"}`}
          onClick={() => updateParams("category", "")}
        >
          すべて
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={currentCategory === cat.id ? "default" : "outline"}
            className={`cursor-pointer ${
              currentCategory === cat.id
                ? "gradient-btn text-white border-0"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
            onClick={() => updateParams("category", currentCategory === cat.id ? "" : cat.id)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={currentTag === tag ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                currentTag === tag
                  ? "bg-purple-500/30 text-purple-300 border-0"
                  : "border-white/5 text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => updateParams("tag", currentTag === tag ? "" : tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SeriesContext, SeriesEntry } from "@/types/article";

function PagerLink({
  entry,
  label,
  direction,
}: {
  entry: SeriesEntry;
  label: string;
  direction: "prev" | "next";
}) {
  return (
    <Link
      href={`/articles/${entry.slug}`}
      className="group flex flex-1 basis-56 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 transition-colors hover:border-[#2563eb] hover:bg-[#eff6ff]"
    >
      {direction === "prev" && (
        <ArrowLeft className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-[#2563eb]" />
      )}
      <span className={direction === "next" ? "ml-auto text-right" : ""}>
        <span className="block text-[0.7rem] tracking-wider text-gray-500">
          {label}
        </span>
        <span className="block text-[0.9rem] font-semibold text-[#1a2332] transition-colors">
          {entry.shortTitle}
        </span>
      </span>
      {direction === "next" && (
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-[#2563eb]" />
      )}
    </Link>
  );
}

export function ArticlePager({ context }: { context: SeriesContext }) {
  const { prev, next, isExtra } = context;
  if (!prev && !next) return null;

  return (
    <nav className="mt-10 flex flex-wrap gap-3">
      {prev && <PagerLink entry={prev} label="前の回" direction="prev" />}
      {next && (
        <PagerLink
          entry={next}
          label={isExtra ? "連載本編" : "次の回"}
          direction="next"
        />
      )}
    </nav>
  );
}

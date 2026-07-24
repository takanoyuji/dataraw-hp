import fs from "fs";
import path from "path";
import { ArticleListItem, ArticleMeta, Series, SeriesContext } from "@/types/article";
import { getAllArticleMetas } from "./articles";

const seriesFile = path.join(process.cwd(), "content/series.json");

export function getSeriesList(): Series[] {
  if (!fs.existsSync(seriesFile)) return [];
  return JSON.parse(fs.readFileSync(seriesFile, "utf8"));
}

/**
 * slug → 所属する連載ID。
 * @param foldExtras true なら番外編も連載に含める（＝連載カードに畳む対象にする）。
 *   false なら番外編は連載に含めず、独立した記事として扱う。
 */
function getSlugToSeriesId(foldExtras: boolean): Map<string, string> {
  const map = new Map<string, string>();
  for (const series of getSeriesList()) {
    for (const a of series.articles) map.set(a.slug, series.id);
    if (foldExtras) {
      for (const e of series.extras ?? []) map.set(e.slug, series.id);
    }
  }
  return map;
}

/**
 * 記事メタの配列を、連載を1枚に畳んだ表示アイテムの配列に変換する。
 * - 入力は publishedAt 降順で並んでいる前提（getAllArticleMetas の出力）。
 * - 連載本編は、最初に出会った時点に連載カード1枚を差し込み、以降の同一連載の
 *   本編はスキップする（＝本編は第1回相当の1枚だけ残る）。
 * - `foldExtras` が true なら番外編も同じ連載カードに畳む（トップの最新記事向け）。
 *   false なら番外編は畳まず、独立した記事カードとして出す（記事一覧向け）。
 * - フィルタで連載の一部だけが渡ってきても、入口（第1回）を代表にして1枚出す。
 */
export function groupArticles(
  articles: ArticleMeta[],
  { foldExtras = true }: { foldExtras?: boolean } = {}
): ArticleListItem[] {
  const slugToId = getSlugToSeriesId(foldExtras);
  const byId = new Map(getSeriesList().map((s) => [s.id, s]));
  const metaBySlug = new Map(getAllArticleMetas().map((m) => [m.slug, m]));
  const seen = new Set<string>();
  const items: ArticleListItem[] = [];

  for (const article of articles) {
    const sid = slugToId.get(article.slug);
    if (!sid) {
      items.push({ type: "article", article });
      continue;
    }
    if (seen.has(sid)) continue;
    seen.add(sid);

    const series = byId.get(sid);
    const rep = series ? metaBySlug.get(series.articles[0].slug) : undefined;
    // 連載定義や第1回が見つからない場合は、畳まずそのまま出す（フォールバック）
    if (!series || !rep) {
      items.push({ type: "article", article });
      continue;
    }
    items.push({
      type: "series",
      series,
      representative: rep,
      latestPublishedAt: article.publishedAt,
      count: series.articles.length,
    });
  }
  return items;
}

/**
 * 記事スラッグから連載の文脈を組み立てる。
 * 連載に属さない記事は null。
 */
export function getSeriesContext(slug: string): SeriesContext | null {
  for (const series of getSeriesList()) {
    const extras = series.extras ?? [];
    const mainIndex = series.articles.findIndex((a) => a.slug === slug);
    const extra = extras.find((a) => a.slug === slug);
    if (mainIndex === -1 && !extra) continue;

    const total = series.articles.length;
    const seriesTitle = `連載: ${series.titleBase ?? series.name}`;

    if (extra) {
      return {
        series,
        entry: extra,
        index: null,
        total,
        isExtra: true,
        label: "番外編",
        seriesTitle,
        positionLabel: "番外編",
        next: series.articles[0],
        extras: extras.filter((e) => e.slug !== slug),
      };
    }

    const isLast = mainIndex === total - 1;
    return {
      series,
      entry: series.articles[mainIndex],
      index: mainIndex + 1,
      total,
      isExtra: false,
      label: `全${total}回`,
      seriesTitle,
      positionLabel: `第${mainIndex + 1}回${isLast ? "（最終回）" : ""}`,
      prev: series.articles[mainIndex - 1],
      next: series.articles[mainIndex + 1],
      extras,
    };
  }
  return null;
}

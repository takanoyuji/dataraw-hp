import { getArticleBySlug, getArticleSlugs } from "@/lib/articles";
import { getCategoryById } from "@/lib/categories";
import { getSeriesContext } from "@/lib/series";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "DataRaw LLC の記事";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** 記事ページ本体と同じ全スラッグ。OGP画像もビルド時に静的生成する */
export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  // 記事が引けない場合もカードは出したいので、ブランド名だけで描く
  if (!article) {
    return renderOgImage({ title: "DataRaw LLC" });
  }

  const series = getSeriesContext(slug);
  const category = getCategoryById(article.category);

  // 連載なら「連載名｜第2回」、単発ならカテゴリ名を上部ラベルにする。
  // 特集(kind: "feature")の positionLabel は記事タイトルそのものなので、
  // そのまま使うと下の大見出しと同じ文言が二重に出る。規模ラベルに差し替える。
  const seriesName = series?.series.shortName ?? series?.series.name;
  const eyebrow = series
    ? `${seriesName}｜${
        series.kind === "feature"
          ? series.isExtra
            ? "番外編"
            : series.label
          : series.positionLabel
      }`
    : category?.name;

  return renderOgImage({
    title: article.title,
    eyebrow,
    date: article.publishedAt,
  });
}

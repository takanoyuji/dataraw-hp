export interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  author: string;
  thumbnail?: string;
  published: boolean;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  author: string;
  thumbnail?: string;
  published: boolean;
}

export interface SeriesEntry {
  slug: string;
  shortTitle: string;
  lead?: string;
}

export interface Series {
  id: string;
  name: string;
  /** 記事タイトルとして使う連載名の幹（回数・「全4回」を除いたもの） */
  titleBase?: string;
  shortName?: string;
  /**
   * "series"（既定）: 順番に読む連載。単位は「回」。
   * "feature": 本編＋補足をまとめた特集。単位は「記事」。第N回とは呼ばない。
   */
  kind?: "series" | "feature";
  articles: SeriesEntry[];
  extras?: SeriesEntry[];
}

/** 記事1本から見た連載の文脈（何回目か・前後の回・番外編） */
export interface SeriesContext {
  series: Series;
  entry: SeriesEntry;
  /** "series"（連載）か "feature"（特集）か */
  kind: "series" | "feature";
  /** 本編なら 1 始まりの回数、番外編なら null */
  index: number | null;
  total: number;
  isExtra: boolean;
  /** 規模ラベル。「全4回」「番外編」 */
  label: string;
  /** 主タイトルに使う連載名。「連載: 〜コンサルに育てた」 */
  seriesTitle: string;
  /** サブタイトルの頭に付ける回数。「第2回」「番外編」 */
  positionLabel: string;
  prev?: SeriesEntry;
  next?: SeriesEntry;
  /** 自分以外の番外編 */
  extras: SeriesEntry[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

/**
 * 一覧・トップで表示する1アイテム。
 * 連載に属する記事は "series" 1枚に畳まれ、それ以外は "article"。
 */
export type ArticleListItem =
  | { type: "article"; article: ArticleMeta }
  | {
      type: "series";
      series: Series;
      /** 連載の入口（第1回）のメタ。カテゴリ・説明はここから取る */
      representative: ArticleMeta;
      /** 畳んだ記事群のうち最新の公開日（並び順に使う） */
      latestPublishedAt: string;
      /** 本編の回数（「全N回」表示用） */
      count: number;
    };

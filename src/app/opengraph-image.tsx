import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "DataRaw LLC — 経営に、再現性を。";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** 記事以外のページ（トップ・会社概要・LP等）が引き継ぐ既定のOGP画像 */
export default async function Image() {
  return renderOgImage({
    title: "経営に、再現性を。",
    eyebrow: "データサイエンスとAIの専門家集団",
  });
}

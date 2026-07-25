import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** OGPの標準サイズ。X・Facebook・Slack いずれもこの比率で表示される */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * ImageResponse は woff2 を読めず、システムフォントにも依存できないため
 * 日本語フォントを同梱して渡す（assets/NotoSansJP-Bold.ttf・SIL OFL 1.1）。
 * 5MB あるのでモジュールスコープで1回だけ読む。
 */
let fontPromise: Promise<Buffer> | null = null;
function loadFont(): Promise<Buffer> {
  fontPromise ??= readFile(join(process.cwd(), "assets", "NotoSansJP-Bold.ttf"));
  return fontPromise;
}

/** タイトルの長さで文字サイズを落とし、4行に収まるようにする */
function titleFontSize(title: string): number {
  if (title.length <= 16) return 68;
  if (title.length <= 24) return 58;
  if (title.length <= 34) return 48;
  return 40;
}

/** "2026-07-25" → "2026.07.25"。パースできない値はそのまま返す */
function formatDate(raw?: string): string | null {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : raw;
}

interface OgImageOptions {
  /** 大きく出す主役の文字列 */
  title: string;
  /** タイトル上に出す小さめのラベル。「連載 全4回｜第2回」など */
  eyebrow?: string;
  /** 右下の日付。ISO(YYYY-MM-DD)を想定 */
  date?: string;
}

/**
 * サイト共通のOGP画像を描く。
 * satori は flexbox のみ対応（grid 不可）で、子を複数持つ要素には
 * display:flex の明示が要る点に注意。
 */
export async function renderOgImage({ title, eyebrow, date }: OgImageOptions) {
  const font = await loadFont();
  const dateLabel = formatDate(date);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#111a2b",
          backgroundImage:
            "linear-gradient(135deg, #1a2332 0%, #212d44 55%, #05070c 100%)",
          fontFamily: "NotoSansJP",
          color: "#ffffff",
        }}
      >
        {/* 左上の青いにじみ。サイト本体のヘッダバンドと同じ色味 */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            backgroundColor: "rgba(37, 99, 235, 0.28)",
            filter: "blur(120px)",
          }}
        />

        {/* 残り高さを占有して縦センター寄せ。短いタイトルでも中央が間延びしない */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {eyebrow && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                border: "2px solid rgba(147, 197, 253, 0.45)",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 26,
                letterSpacing: 2,
                color: "#bfdbfe",
                // ラベルは必ず1行。長い連載名でも枠が2段に膨らまないようにする
                whiteSpace: "nowrap",
              }}
            >
              {eyebrow.length > 32 ? `${eyebrow.slice(0, 32)}…` : eyebrow}
            </div>
          )}
          <div
            style={{
              marginTop: eyebrow ? 36 : 0,
              fontSize: titleFontSize(title),
              lineHeight: 1.45,
              letterSpacing: -0.5,
              color: "#ffffff",
              // 長すぎるタイトルは4行で打ち切る
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 4,
              overflow: "hidden",
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: "100%",
              height: 2,
              backgroundColor: "rgba(255, 255, 255, 0.16)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 32,
                  backgroundColor: "#2563eb",
                  borderRadius: 2,
                }}
              />
              <div style={{ fontSize: 32, letterSpacing: 1 }}>DataRaw LLC</div>
            </div>
            {dateLabel && (
              <div style={{ fontSize: 26, color: "rgba(191, 219, 254, 0.75)" }}>
                {dateLabel}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "NotoSansJP",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}

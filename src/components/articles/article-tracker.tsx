"use client";

import { useEffect, useRef } from "react";

/**
 * 記事の「表示」と「読了」を自前APIに記録する。
 * - 表示(view): マウント時に1回。
 * - 読了(read): 記事末尾のセンチネルが見え、かつ滞在が DWELL_MS 以上のとき1回。
 *   （流し読み・直帰を除外する条件。二重送信はガード）
 * サーバー側で「同日同一訪問者は二重計上しない」ため、多少の重複送信は害がない。
 */
const DWELL_MS = 10_000;

function send(slug: string, kind: "view" | "read") {
  const body = JSON.stringify({ slug, kind });
  // 離脱時でも飛ぶよう sendBeacon 優先、なければ fetch(keepalive)
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
}

export function ArticleTracker({ slug }: { slug: string }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const readSent = useRef(false);

  useEffect(() => {
    send(slug, "view");

    const mountedAt = Date.now();
    let reachedEnd = false;
    let dwellTimer: ReturnType<typeof setTimeout> | null = null;

    const fireReadIfReady = () => {
      if (readSent.current) return;
      if (reachedEnd && Date.now() - mountedAt >= DWELL_MS) {
        readSent.current = true;
        send(slug, "read");
        if (dwellTimer) clearTimeout(dwellTimer);
        observer.disconnect();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reachedEnd = true;
          const remaining = DWELL_MS - (Date.now() - mountedAt);
          if (remaining <= 0) {
            fireReadIfReady();
          } else if (!dwellTimer) {
            dwellTimer = setTimeout(fireReadIfReady, remaining);
          }
        }
      },
      { threshold: 1 }
    );

    if (sentinel.current) observer.observe(sentinel.current);

    return () => {
      observer.disconnect();
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [slug]);

  return <div ref={sentinel} aria-hidden className="h-px w-full" />;
}

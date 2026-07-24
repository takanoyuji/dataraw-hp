"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = "G-BQVYN4QPDP";

/**
 * GA4。初回ロードは gtag config が page_view を送る。
 * このサイトは Next.js のクライアント遷移でページを再読み込みしないため、
 * 記事間の回遊で page_view が飛ばない。pathname 変化のたびに手動で送る。
 */
export function GA4() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    // 初回は config 側が送るので二重計上を避けてスキップ
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== "function") return;
    w.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

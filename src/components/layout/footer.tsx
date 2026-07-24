import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-black pt-16 pb-8 border-t border-white/5">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold gradient-text tracking-tight">
              DataRaw LLC
            </Link>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              経営に、<br />
              再現性を。
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://twitter.com/takano_yuji_ds"
                aria-label="高野悠司のX（旧Twitter）"
                className="p-2 rounded-lg border border-white/5 text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              事業内容
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/ds", label: "データサイエンス事業" },
                { href: "/lp", label: "Web開発事業" },
                { href: "/articles", label: "ブログ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              会社情報
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "会社概要" },
                { href: "/ceo", label: "代表紹介" },
                { href: "/privacy-policy", label: "プライバシーポリシー" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              所在地
            </h3>
            <address className="not-italic text-sm text-gray-400 leading-relaxed">
              〒160-0023<br />
              東京都新宿区西新宿7-5-9<br />
              ファーストリアルタワー新宿2901
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-gray-400 text-xs text-center">
            &copy; {new Date().getFullYear()} DataRaw LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";

/**
 * 代表写真の表示切り替え（一時的に非公開中）。
 *
 * 元に戻すときは次の2つを両方やること。片方だけだと画像が404になる。
 *   1. この定数を true にする
 *   2. 画像ファイルを公開ディレクトリに戻す
 *      git mv assets/profile/takano.jpg public/images/takano.jpg
 *
 * 直リンクでも見えないように、画像は public/ の外（assets/profile/）へ退避してある。
 * 写真側のマークアップは復帰用にそのまま残してあるので消さないこと。
 */
const SHOW_PROFILE_PHOTO: boolean = false;

export function Profile() {
  return (
    <section id="profile" className="py-24 section-darker relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader title="代表プロフィール" />
        </ScrollAnimation>
        <div
          className={cn(
            "flex flex-col items-center gap-12",
            // 写真があるときだけ左右2カラム。無いときは1カラムのまま中央に置く
            SHOW_PROFILE_PHOTO && "md:flex-row md:gap-20"
          )}
        >
          {SHOW_PROFILE_PHOTO && (
            <ScrollAnimation className="md:w-1/3">
              <div className="relative max-w-[280px] mx-auto">
                {/* Animated ring */}
                <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-sm animate-spin-slow" />
                <div className="relative rounded-full p-1 bg-gradient-to-tr from-blue-500/50 via-purple-500/50 to-pink-500/50">
                  <Image
                    src="/images/takano.jpg"
                    alt="高野 悠司 プロフィール"
                    width={400}
                    height={400}
                    className="rounded-full w-full h-auto object-cover bg-black"
                  />
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* 写真が無いときは全幅に広げず、読みやすい幅で中央に収める */}
          <ScrollAnimation
            className={SHOW_PROFILE_PHOTO ? "md:w-2/3" : "w-full max-w-3xl"}
            delay={SHOW_PROFILE_PHOTO ? 200 : 0}
          >
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">高野 悠司</h3>
                <p className="text-sm text-gray-500">合同会社データロー 代表</p>
              </div>

              <p className="text-gray-300 leading-relaxed">
                筑波大学・大学院で理論統計、会計工学を研究した後、アクセンチュアに入社。ベイカレントコンサルティングへの転職後、データサイエンティストとして独立。フリーランスとしての経験を元に合同会社データローを創業。
              </p>

              <div className="flex flex-wrap gap-2">
                {["アクセンチュア", "ベイカレント", "データサイエンス", "機械学習", "6店舗運営"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/ceo"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-btn text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
                >
                  詳細を見る
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://twitter.com/takano_yuji_ds"
                  aria-label="高野悠司のX（旧Twitter）"
                  className="p-3 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}

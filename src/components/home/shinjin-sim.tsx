import { ArrowRight, Gamepad2 } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";

/** 新人しごとシミュレーター（無料版）への導線。ゲームと LP は public/shinjin-sim の単体HTMLなので next/link を使わない */
export function ShinjinSim() {
  return (
    <section className="py-16 section-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <div className="glass-card p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                新人研修ゲーム / 無料で遊べます
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">新人しごとシミュレーター</h2>
              <p className="text-gray-400 leading-relaxed">
                報連相、確認、断り方、頼み方。上司の無茶ぶりにどう返すかを、1話5分のゲームでくり返す。登録なし・スマホのブラウザで、全10話。
              </p>
            </div>
            <div className="flex flex-col gap-3 md:w-64 shrink-0">
              <a
                href="/shinjin-sim/play"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-6 py-3 font-bold text-white transition-colors"
              >
                無料版を遊ぶ
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/shinjin-sim" className="text-center text-sm text-gray-400 hover:text-white underline underline-offset-4">
                研修担当の方へ（法人プラン）
              </a>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

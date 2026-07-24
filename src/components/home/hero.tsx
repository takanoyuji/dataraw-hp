"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // マウント判定フラグ。ハイドレーション後に一度だけ立てる意図的な同期更新
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <section
      id="home"
      className="min-h-[85vh] flex items-center justify-center relative overflow-hidden"
    >
      {/* Layered background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black z-10" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-float" />
        <div
          className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] animate-float"
          style={{ animationDelay: "6s" }}
        />

        {/* Subtle noise / grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_60%)] z-20" />
        <div className="absolute inset-0 opacity-[0.03] z-20" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="text-center md:text-left max-w-3xl">
          {/* Pill badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-400 mb-8 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            データサイエンスとAIの専門家集団
          </div>

          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight transition-all duration-1000 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="block text-white">経営に、</span>
            <span className="gradient-text">再現性を。</span>
          </h1>

          <p
            className={`text-lg md:text-xl text-gray-400 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            勘や経験に頼りがちな経営の意思決定に、データで根拠と再現性をもたらす。
            感覚で決めていた一手を、検証できるものに変えます。
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center md:justify-start transition-all duration-1000 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full gradient-btn text-white font-medium text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
            >
              お問い合わせはこちら
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/15 text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/25 font-medium text-lg transition-all duration-300"
            >
              ブログを読む
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

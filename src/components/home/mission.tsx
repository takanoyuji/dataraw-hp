"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";

// 代表数値は「自社で実践 × 顧客で実証」の2軸でMECEに揃える。
// 左の柱 = 自ら事業を運営して得た実績、右の柱 = 支援先で再現した成果。
const pillars = [
  {
    header: "自社事業成果",
    stats: [
      { value: 6, suffix: "事業", label: "運営中の事業" },
      { value: 2000, suffix: "万円", label: "月商実績" },
    ],
  },
  {
    header: "顧客貢献",
    stats: [
      { value: 20, prefix: "+", suffix: "億円", label: "年間売上貢献" },
      { value: 5, prefix: "−", suffix: "%", label: "解約率の改善" },
    ],
  },
];

function AnimatedNumber({
  value,
  suffix,
  prefix = "",
}: {
  value: number;
  suffix: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Mission() {
  return (
    <section id="mission" className="py-24 section-dark relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader title="ミッション" />
        </ScrollAnimation>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
          <ScrollAnimation className="md:w-1/2">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 gradient-text tracking-tight leading-tight">
              経営に、
              <br />
              再現性を。
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              私たちは、データと科学的アプローチで、勘や立場や空気で決まりがちな意思決定を、根拠にもとづくものへ変えていきます。
              再現性のある意思決定こそが、事業を継続的に強くすると考えています。
            </p>
            <p className="text-gray-400 leading-relaxed">
              理論だけでなく実践にもこだわり、自ら複数の事業を運営することで得た知見を活かし、
              クライアントの課題解決に取り組んでいます。
            </p>
          </ScrollAnimation>

          {/* Stats: 「自社事業成果」「顧客貢献」の2軸を、常に横並びで対等に見せる。
              数値より軸名（枠のタイトル）を主役にする。 */}
          <ScrollAnimation className="md:w-5/12" delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.header}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  {/* 枠のタイトル = 軸名（ここが主役） */}
                  <h4 className="mb-4 border-b border-white/10 pb-3 text-center text-lg font-bold tracking-tight text-white md:text-xl">
                    {pillar.header}
                  </h4>
                  <div className="space-y-4">
                    {pillar.stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-xl font-semibold text-blue-300 md:text-2xl">
                          <AnimatedNumber
                            value={stat.value}
                            suffix={stat.suffix}
                            prefix={"prefix" in stat ? stat.prefix : ""}
                          />
                        </div>
                        <div className="mt-0.5 text-xs tracking-wide text-gray-500">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}

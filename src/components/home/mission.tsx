"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";

const stats = [
  { value: 6, suffix: "店舗", label: "自社運営実績" },
  { value: 2000, suffix: "万円", label: "月商実績" },
  { value: 5, suffix: "%", label: "解約率削減" },
  { value: 20, suffix: "億円", label: "売上貢献" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
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

          {/* Stats grid */}
          <ScrollAnimation className="md:w-5/12" delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="glass-card p-5 text-center group hover:border-blue-500/30 transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 tracking-wide">
                    {stat.label}
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

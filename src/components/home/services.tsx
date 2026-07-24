import Link from "next/link";
import { BarChart3, Code2, Building2, ArrowUpRight } from "lucide-react";
import { ScrollAnimation } from "@/components/shared/scroll-animation";
import { SectionHeader } from "@/components/shared/section-header";

const services = [
  {
    icon: BarChart3,
    title: "データサイエンス事業",
    href: "/ds",
    accent: "from-blue-500 to-cyan-500",
    accentBg: "from-blue-500/20 to-cyan-500/20",
    items: [
      "データ利活用のコンサルティング",
      "機械学習・予測モデルの構築",
      "AI活用支援",
      "データ分析基盤の設計・構築",
    ],
  },
  {
    icon: Code2,
    title: "Web開発事業",
    href: "/lp",
    accent: "from-purple-500 to-pink-500",
    accentBg: "from-purple-500/20 to-pink-500/20",
    items: [
      "生成AIを活用した効率的な開発",
      "目的整理から開発まで一貫支援",
      "システム設計・開発",
      "集客支援・マーケティング",
    ],
  },
  {
    icon: Building2,
    title: "店舗経営",
    href: undefined,
    accent: "from-amber-500 to-orange-500",
    accentBg: "from-amber-500/20 to-orange-500/20",
    items: [
      "飲食店の運営",
      "撮影スタジオの運営",
      "現場理解を重視した実践的知見",
      "6店舗の自社運営実績",
    ],
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 section-darker relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollAnimation>
          <SectionHeader title="事業内容" />
        </ScrollAnimation>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <ScrollAnimation key={service.title} delay={i * 120}>
              <ServiceCard {...service} />
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  href,
  accent,
  accentBg,
  items,
}: (typeof services)[0]) {
  const content = (
    <div className="glass-card p-6 h-full group hover:border-white/20 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${accentBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-7 w-7 text-white/80" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
          {title}
        </h3>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        )}
      </div>
      <ul className="text-gray-400 space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${accent} shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

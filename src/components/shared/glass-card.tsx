import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className, hover = true, glow = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6 relative overflow-hidden",
        hover &&
          "hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300",
        glow && "animate-glow-pulse",
        className
      )}
    >
      {/* Shimmer effect on hover */}
      {hover && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none animate-shimmer rounded-xl" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

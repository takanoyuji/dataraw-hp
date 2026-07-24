interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export function SectionHeader({ title, subtitle, align = "center" }: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${align === "center" ? "text-center" : ""}`}>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
        {title}
      </h2>
      <div
        className={`h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
      {subtitle && (
        <p className={`text-gray-400 mt-6 max-w-2xl leading-relaxed ${
          align === "center" ? "mx-auto" : ""
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

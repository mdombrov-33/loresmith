"use client";

import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface ThemeCardProps {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  examples: readonly string[];
  index: number;
  isVisible: boolean;
  isLastOdd?: boolean;
}

export default function ThemeCard({
  name,
  slug,
  icon: Icon,
  description,
  gradient,
  borderColor,
  textColor,
  examples,
  index,
  isVisible,
  isLastOdd = false,
}: ThemeCardProps) {
  const router = useRouter();

  return (
    <div
      className={`border-border bg-card/50 group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-700 hover:scale-105 ${borderColor} hover:shadow-2xl ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${isLastOdd ? "md:col-span-2 lg:col-span-1" : ""}`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={() => router.push(`/?theme=${slug}`)}
      role="button"
      tabIndex={0}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${gradient}`}
      />

      <div className="relative z-10 p-8">
        {/* Icon */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${borderColor} bg-background/50`}
          >
            <Icon className={`h-7 w-7 ${textColor}`} />
          </div>
          <h3 className="text-foreground text-2xl font-bold">{name}</h3>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>

        {/* Examples */}
        <div className="space-y-2">
          <div
            className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}
          >
            Story Elements
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <span
                key={example}
                className={`bg-background/80 rounded-full border px-3 py-1 text-xs ${borderColor} ${textColor}`}
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

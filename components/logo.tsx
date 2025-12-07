"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "footer" | "compact";
  className?: string;
  showLink?: boolean;
}

export function Logo({ variant = "default", className, showLink = true }: LogoProps) {
  const content = (
    <div className={cn(
      "flex items-baseline gap-2 text-white",
      variant === "footer" && "justify-center",
      variant === "compact" && "gap-1.5",
      className
    )}>
      <span className={cn(
        "font-black uppercase tracking-tight font-[family-name:var(--font-orbitron)]",
        variant === "default" && "text-2xl sm:text-3xl",
        variant === "footer" && "text-xl sm:text-2xl",
        variant === "compact" && "text-lg sm:text-xl"
      )}>
        KRAKEN
      </span>
      <span className={cn(
        "font-bold uppercase font-[family-name:var(--font-orbitron)] text-red-500",
        variant === "default" && "text-sm sm:text-base",
        variant === "footer" && "text-xs sm:text-sm",
        variant === "compact" && "text-xs"
      )}>
        ELITE FITNESS
      </span>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="block">
        {content}
      </Link>
    );
  }

  return content;
}


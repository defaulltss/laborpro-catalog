"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/translations";

interface NavHeaderProps {
  locale: Locale;
}

export default function NavHeader({ locale }: NavHeaderProps) {
  const pathname = usePathname();

  function switchLocalePath(target: Locale) {
    // Replace /lv/ or /en/ prefix with the target locale
    return pathname.replace(/^\/(lv|en)/, `/${target}`);
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 animate-fade-in">
      <Link
        href="/"
        className="text-lg font-bold text-brand-dark tracking-tight hover:text-brand-pink transition-colors"
      >
        Labor Pro
      </Link>
      <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border border-brand-pink/20">
        <Link
          href={switchLocalePath("lv")}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            locale === "lv"
              ? "bg-brand-pink text-white"
              : "text-brand-grey hover:text-brand-dark"
          }`}
        >
          LV
        </Link>
        <Link
          href={switchLocalePath("en")}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            locale === "en"
              ? "bg-brand-pink text-white"
              : "text-brand-grey hover:text-brand-dark"
          }`}
        >
          EN
        </Link>
      </div>
    </header>
  );
}

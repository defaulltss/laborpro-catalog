"use client";

import { useState } from "react";
import Link from "next/link";

const translations = {
  lv: {
    heroTitle: "Labor Pro",
    heroSubtitle: "Profesionālo skaistumkopšanas produktu katalogs",
    heroDescription:
      "Atklājiet plašu profesionālo skaistumkopšanas produktu klāstu — matu kopšana, kosmētika, instrumenti un piederumi saloniem.",
    cta: "Apskatīt katalogu",
    statsCategories: "Kategorijas",
    statsProducts: "Produkti",
    featuredTitle: "Populārākās kategorijas",
    footerText: "© 2026 Labor Pro. Profesionālie skaistumkopšanas produkti.",
    categories: [
      "Matu kopšana",
      "Matu krāsošana",
      "Vienreizējās lietošanas preces",
      "Kosmētikas piederumi",
      "Instrumenti",
      "Salona mēbeles",
    ],
  },
  en: {
    heroTitle: "Labor Pro",
    heroSubtitle: "Professional Beauty Products Catalog",
    heroDescription:
      "Discover a wide range of professional beauty products — hair care, cosmetics, tools, and accessories for salons.",
    cta: "Browse Catalog",
    statsCategories: "Categories",
    statsProducts: "Products",
    featuredTitle: "Top Categories",
    footerText: "© 2026 Labor Pro. Professional beauty products.",
    categories: [
      "Hair Care",
      "Hair Coloring",
      "Disposable Products",
      "Cosmetic Accessories",
      "Tools",
      "Salon Furniture",
    ],
  },
};

const categoryNumbers = ["01", "02", "03", "06", "10", "20"];

export default function Home() {
  const [lang, setLang] = useState<"lv" | "en">("lv");
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <span className="text-xl font-bold text-brand-dark tracking-tight">
          Labor Pro
        </span>
        <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border border-brand-pink/20">
          <button
            onClick={() => setLang("lv")}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              lang === "lv"
                ? "bg-brand-pink text-white"
                : "text-brand-grey hover:text-brand-dark"
            }`}
          >
            LV
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              lang === "en"
                ? "bg-brand-pink text-white"
                : "text-brand-grey hover:text-brand-dark"
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-brand-pink/30 to-brand-peach/60 text-sm font-medium text-brand-dark">
            {t.heroSubtitle}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-brand-dark tracking-tight mb-4">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-brand-grey max-w-lg mx-auto mb-10 leading-relaxed">
            {t.heroDescription}
          </p>
          <Link
            href={`/${lang}/categories`}
            className="inline-block bg-gradient-to-r from-brand-pink to-brand-peach px-8 py-4 rounded-2xl text-brand-dark font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {t.cta} →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-8">
        <div className="max-w-md mx-auto flex justify-center gap-12">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-dark">22</p>
            <p className="text-sm text-brand-grey mt-1">{t.statsCategories}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-dark">
              2137+
            </p>
            <p className="text-sm text-brand-grey mt-1">{t.statsProducts}</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-lg font-semibold text-brand-grey mb-6">
            {t.featuredTitle}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {t.categories.map((name, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 bg-gradient-to-br from-brand-pink to-brand-peach flex flex-col justify-between aspect-[4/3]"
              >
                <span className="text-2xl font-bold text-white/80">
                  {categoryNumbers[i]}
                </span>
                <p className="text-sm font-semibold text-brand-dark leading-tight">
                  {name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-sm text-brand-grey">{t.footerText}</p>
      </footer>
    </div>
  );
}

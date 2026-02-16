import Link from "next/link";
import { Category } from "@/lib/types";
import { Locale, getTranslations } from "@/lib/translations";

interface CategoryCardProps {
  category: Category;
  locale: Locale;
  index?: number;
}

export default function CategoryCard({ category, locale, index = 0 }: CategoryCardProps) {
  const t = getTranslations(locale);
  const name = locale === "en" ? category.name_en : category.name_lv;

  return (
    <Link href={`/${locale}/categories/${category.slug}`}>
      <div
        className="animate-fade-in-up rounded-2xl p-4 aspect-square flex flex-col justify-between bg-gradient-to-br from-brand-pink to-brand-peach hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        style={{ "--stagger": `${index * 50}ms` } as React.CSSProperties}
      >
        <span className="text-3xl md:text-4xl font-bold text-white/80">
          {category.number}
        </span>
        <div>
          <p className="text-sm md:text-base font-semibold text-brand-dark leading-tight">
            {name}
          </p>
          <p className="text-xs text-brand-dark/60 mt-0.5">
            {category.productCount} {t.productCount}
          </p>
        </div>
      </div>
    </Link>
  );
}

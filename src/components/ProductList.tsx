"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product, Category } from "@/lib/types";
import { Locale, getTranslations } from "@/lib/translations";
import ProductListItem from "./ProductListItem";
import SearchBar from "./SearchBar";
import BackButton from "./BackButton";
import Header from "./Header";

interface ProductListProps {
  category: Category;
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  locale: Locale;
}

export default function ProductList({
  category,
  products,
  currentPage,
  totalPages,
  totalProducts,
  locale,
}: ProductListProps) {
  const t = getTranslations(locale);
  const [filtered, setFiltered] = useState(products);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryName = locale === "en" ? category.name_en : category.name_lv;

  function normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[āà]/g, 'a')
      .replace(/[čć]/g, 'c')
      .replace(/[ēė]/g, 'e')
      .replace(/[ģ]/g, 'g')
      .replace(/[īį]/g, 'i')
      .replace(/[ķ]/g, 'k')
      .replace(/[ļļ]/g, 'l')
      .replace(/[ņ]/g, 'n')
      .replace(/[šś]/g, 's')
      .replace(/[ūų]/g, 'u')
      .replace(/[žź]/g, 'z');
  }

  function handleSearch(query: string) {
    if (!query.trim()) {
      setFiltered(products);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = normalize(query);
    setFiltered(
      products.filter(
        (p) =>
          normalize(p.name_lv || '').includes(q) ||
          normalize(p.name_en || '').includes(q) ||
          normalize(p.sku || '').includes(q)
      )
    );
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <>
      <BackButton href={`/${locale}/categories`} label={t.categories} />
      <Header title={categoryName} subtitle={locale === "en" ? category.name_lv : category.name_en} />
      <SearchBar
        placeholder={t.searchProduct}
        onSearch={handleSearch}
      />
      <div className="pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:px-4">
        {filtered.map((product, i) => (
          <ProductListItem key={product.id} product={product} locale={locale} index={i} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-brand-grey py-8">
            {t.noProducts}
          </p>
        )}
      </div>

      {!isSearching && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 py-6 px-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-2 text-sm rounded-lg border border-brand-pink/30 hover:bg-brand-pink/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &larr; {t.prev}
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-brand-grey">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item as number)}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                      item === currentPage
                        ? "bg-brand-pink text-white border-brand-pink"
                        : "border-brand-pink/30 hover:bg-brand-pink/10"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-2 text-sm rounded-lg border border-brand-pink/30 hover:bg-brand-pink/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t.next} &rarr;
          </button>
        </nav>
      )}

      {!isSearching && (
        <p className="text-center text-xs text-brand-grey pb-6">
          {totalProducts} {t.totalProducts}
        </p>
      )}
    </>
  );
}

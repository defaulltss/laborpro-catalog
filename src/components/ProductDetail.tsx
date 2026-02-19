"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, Category } from "@/lib/types";
import { Locale, getTranslations } from "@/lib/translations";
import PriceInquiry from "./PriceDisplay";
import BackButton from "./BackButton";

interface ProductDetailProps {
  product: Product;
  category?: Category;
  locale: Locale;
}

export default function ProductDetail({
  product,
  category,
  locale,
}: ProductDetailProps) {
  const t = getTranslations(locale);
  const displayName = locale === "en"
    ? (product.name_en || product.name_lv || product.sku)
    : (product.name_lv || product.name_en || product.sku);
  const secondaryName = locale === "en"
    ? (product.name_lv && product.name_en ? product.name_lv : null)
    : (product.name_en && product.name_lv ? product.name_en : null);
  const categoryName = category
    ? (locale === "en" ? category.name_en : category.name_lv)
    : t.categories;
  const localImages = product.images.filter((img) => img.startsWith("/") || img.startsWith("https://"));
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <BackButton
        href={
          category
            ? `/${locale}/categories/${category.slug}`
            : `/${locale}/categories`
        }
        label={categoryName}
      />

      <div className="md:flex md:gap-8 md:items-start md:px-4 mt-8 md:mt-12">
        {/* Image area */}
        <div className="animate-fade-in-up mx-4 mt-3 md:mx-0 md:mt-0 md:w-1/2 md:sticky md:top-4">
          <div className={`rounded-2xl h-56 md:h-80 flex items-center justify-center overflow-hidden ${localImages.length > 0 ? "bg-white" : "bg-brand-light-grey"}`}>
            {localImages.length > 0 ? (
              <Image
                src={localImages[activeIndex]}
                alt={displayName}
                width={600}
                height={600}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <svg
                className="w-16 h-16 text-brand-grey/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            )}
          </div>

          {/* Thumbnail strip */}
          {localImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {localImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeIndex
                      ? "border-brand-pink"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${displayName} ${i + 1}`}
                    width={56}
                    height={56}
                    className="w-full h-full object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="animate-fade-in-up px-4 pt-4 pb-8 md:w-1/2 md:px-0" style={{ "--stagger": "100ms" } as React.CSSProperties}>
        <h1 className="text-xl font-bold text-brand-dark">{displayName}</h1>
        {secondaryName && (
          <p className="text-sm text-brand-grey mt-1">{secondaryName}</p>
        )}

        <div className="mt-3">
          <PriceInquiry productName={displayName} sku={product.sku} size="lg" locale={locale} />
        </div>

        {/* Details grid */}
        <div className="mt-4 space-y-2">
          {product.sku && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">{t.sku}</span>
              <span className="text-brand-dark font-medium">{product.sku}</span>
            </div>
          )}
          {product.ean && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">{t.ean}</span>
              <span className="text-brand-dark font-medium">{product.ean}</span>
            </div>
          )}
          {product.brand && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">{t.brand}</span>
              <span className="text-brand-dark font-medium">
                {product.brand}
              </span>
            </div>
          )}
          {category && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">{t.category}</span>
              <span className="text-brand-dark font-medium">
                {categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {(product.description_lv || product.description_en) && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-brand-dark mb-2">
              {t.aboutProduct}
            </h2>
            <p className="text-sm text-brand-grey leading-relaxed whitespace-pre-line">
              {locale === "en" ? (product.description_en || product.description_lv) : (product.description_lv || product.description_en)}
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

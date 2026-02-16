"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, Category } from "@/lib/types";
import PriceInquiry from "./PriceDisplay";
import BackButton from "./BackButton";

interface ProductDetailProps {
  product: Product;
  category?: Category;
}

export default function ProductDetail({
  product,
  category,
}: ProductDetailProps) {
  const displayName = product.name_lv || product.name_en || product.sku;
  const localImages = product.images.filter((img) => img.startsWith("/"));
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <BackButton
        href={
          category
            ? `/lv/categories/${category.slug}`
            : "/lv/categories"
        }
        label={category ? category.name_lv : "Kategorijas"}
      />

      <div className="md:flex md:gap-8 md:items-start md:px-4 mt-8 md:mt-12">
        {/* Image area */}
        <div className="mx-4 mt-3 md:mx-0 md:mt-0 md:w-1/2 md:sticky md:top-4">
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
        <div className="px-4 pt-4 pb-8 md:w-1/2 md:px-0">
        <h1 className="text-xl font-bold text-brand-dark">{displayName}</h1>
        {product.name_en && product.name_lv && (
          <p className="text-sm text-brand-grey mt-1">{product.name_en}</p>
        )}

        <div className="mt-3">
          <PriceInquiry productName={displayName} sku={product.sku} size="lg" />
        </div>

        {/* Details grid */}
        <div className="mt-4 space-y-2">
          {product.sku && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">Artikuls</span>
              <span className="text-brand-dark font-medium">{product.sku}</span>
            </div>
          )}
          {product.ean && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">EAN</span>
              <span className="text-brand-dark font-medium">{product.ean}</span>
            </div>
          )}
          {product.brand && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">Zīmols</span>
              <span className="text-brand-dark font-medium">
                {product.brand}
              </span>
            </div>
          )}
          {category && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-grey">Kategorija</span>
              <span className="text-brand-dark font-medium">
                {category.name_lv}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description_lv && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-brand-dark mb-2">
              Par produktu
            </h2>
            <p className="text-sm text-brand-grey leading-relaxed whitespace-pre-line">
              {product.description_lv}
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

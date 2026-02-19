import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Locale, getTranslations } from "@/lib/translations";
import PriceInquiry from "./PriceDisplay";

interface ProductListItemProps {
  product: Product;
  locale: Locale;
  index?: number;
}

export default function ProductListItem({ product, locale, index = 0 }: ProductListItemProps) {
  const t = getTranslations(locale);
  const displayName = locale === "en"
    ? (product.name_en || product.name_lv || product.sku)
    : (product.name_lv || product.name_en || product.sku);
  const hasImage = product.images.length > 0 && (product.images[0].startsWith('/') || product.images[0].startsWith('https://'));

  return (
    <Link href={`/${locale}/products/${product.id}`} className="md:h-full">
      <div
        className="animate-fade-in-up flex items-center gap-3 px-4 py-3 hover:bg-brand-pink/10 active:bg-brand-pink/20 transition-all duration-200 border-b border-brand-pink/10 last:border-b-0 md:flex-col md:items-stretch md:p-4 md:rounded-xl md:border md:border-brand-pink/30 md:shadow-sm md:hover:shadow-md md:hover:scale-[1.02] md:bg-white md:h-full"
        style={{ "--stagger": `${index * 30}ms` } as React.CSSProperties}
      >
        <div className={`w-14 h-14 md:w-full md:h-32 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${hasImage ? "bg-white" : "bg-brand-light-grey md:bg-brand-grey/20"}`}>
          {hasImage ? (
            <Image
              src={product.images[0]}
              alt={displayName}
              width={200}
              height={200}
              className="w-full h-full object-contain"
            />
          ) : (
            <svg
              className="w-6 h-6 md:w-10 md:h-10 text-brand-grey/40"
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
        <div className="flex-1 min-w-0 md:mt-3 md:h-14">
          <p className="text-sm font-medium text-brand-dark truncate md:whitespace-normal md:line-clamp-2">
            {displayName}
          </p>
          <p className="text-xs text-brand-grey mt-0.5 truncate">{product.sku}</p>
        </div>
        <div className="md:mt-auto">
          <PriceInquiry productName={displayName} sku={product.sku} locale={locale} />
        </div>
      </div>
    </Link>
  );
}

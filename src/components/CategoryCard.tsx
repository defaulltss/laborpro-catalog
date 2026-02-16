import Link from "next/link";
import { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/lv/categories/${category.slug}`}>
      <div className="rounded-2xl p-4 aspect-square flex flex-col justify-between bg-gradient-to-br from-brand-pink to-brand-peach hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98] transition-transform">
        <span className="text-3xl md:text-4xl font-bold text-white/80">
          {category.number}
        </span>
        <div>
          <p className="text-sm md:text-base font-semibold text-brand-dark leading-tight">
            {category.name_lv}
          </p>
          <p className="text-xs text-brand-dark/60 mt-0.5">
            {category.productCount} produkti
          </p>
        </div>
      </div>
    </Link>
  );
}

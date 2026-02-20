import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategoryPaginated } from "@/lib/data";
import { getTranslations, Locale } from "@/lib/translations";
import ProductList from "@/components/ProductList";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = getTranslations(locale as Locale);
  const category = getCategoryBySlug(slug);
  if (!category) return { title: t.notFound };
  const name = locale === "en" ? category.name_en : category.name_lv;
  return {
    title: `${name} | ${t.catalogTitle}`,
    description: `${name} - ${category.name_en}`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { page } = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const { products, totalPages, totalProducts } = await getProductsByCategoryPaginated(slug, currentPage);

  return (
    <ProductList
      key={currentPage}
      category={category}
      products={products}
      currentPage={currentPage}
      totalPages={totalPages}
      totalProducts={totalProducts}
      locale={locale as Locale}
    />
  );
}

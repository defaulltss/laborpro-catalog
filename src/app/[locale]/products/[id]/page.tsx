import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getCategoryById } from "@/lib/data";
import { getTranslations, Locale } from "@/lib/translations";
import ProductDetail from "@/components/ProductDetail";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = getTranslations(locale as Locale);
  const product = await getProductById(Number(id));
  if (!product) return { title: t.notFound };
  const name = locale === "en"
    ? (product.name_en || product.name_lv || product.sku)
    : (product.name_lv || product.name_en || product.sku);
  return {
    title: `${name} | ${t.catalogTitle}`,
    description: (locale === "en" ? (product.description_en || product.description_lv) : product.description_lv) || name,
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  const category = getCategoryById(product.categoryId);
  return <ProductDetail product={product} category={category} locale={locale as Locale} />;
}

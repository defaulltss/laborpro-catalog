import { Metadata } from "next";
import { getCategories } from "@/lib/data";
import { getTranslations, Locale } from "@/lib/translations";
import CategoryGrid from "@/components/CategoryGrid";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return {
    title: `${t.categories} | ${t.catalogTitle}`,
    description: t.catalogDescription,
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const categories = getCategories();
  return <CategoryGrid categories={categories} locale={locale as Locale} />;
}

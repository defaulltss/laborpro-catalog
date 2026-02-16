import { Metadata } from "next";
import { getCategories } from "@/lib/data";
import CategoryGrid from "@/components/CategoryGrid";

export const metadata: Metadata = {
  title: "Kategorijas | Labor Pro Katalogs",
  description: "Labor Pro produktu kategorijas",
};

export default function CategoriesPage() {
  const categories = getCategories();
  return <CategoryGrid categories={categories} />;
}

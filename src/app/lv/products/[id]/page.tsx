import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getCategoryById } from "@/lib/data";
import ProductDetail from "@/components/ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) return { title: "Nav atrasts" };
  const name = product.name_lv || product.name_en || product.sku;
  return {
    title: `${name} | Labor Pro Katalogs`,
    description: product.description_lv || name,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) notFound();

  const category = getCategoryById(product.categoryId);
  return <ProductDetail product={product} category={category} />;
}

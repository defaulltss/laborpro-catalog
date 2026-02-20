import { getCategories, getAllProducts } from "@/lib/data";
import { getHiddenProductIds } from "@/lib/db";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = getCategories();
  const allProducts = getAllProducts();
  const hidden = await getHiddenProductIds();

  const visibleCount = allProducts.filter((p) => !hidden.has(p.id)).length;

  return (
    <LandingPage productCount={visibleCount} categoryCount={categories.length} />
  );
}

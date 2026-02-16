"use client";

import { useState } from "react";
import { Product, Category } from "@/lib/types";
import ProductListItem from "./ProductListItem";
import SearchBar from "./SearchBar";
import BackButton from "./BackButton";
import Header from "./Header";

interface ProductListProps {
  category: Category;
  products: Product[];
}

export default function ProductList({ category, products }: ProductListProps) {
  const [filtered, setFiltered] = useState(products);

  function normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[āà]/g, 'a')
      .replace(/[čć]/g, 'c')
      .replace(/[ēė]/g, 'e')
      .replace(/[ģ]/g, 'g')
      .replace(/[īį]/g, 'i')
      .replace(/[ķ]/g, 'k')
      .replace(/[ļļ]/g, 'l')
      .replace(/[ņ]/g, 'n')
      .replace(/[šś]/g, 's')
      .replace(/[ūų]/g, 'u')
      .replace(/[žź]/g, 'z');
  }

  function handleSearch(query: string) {
    if (!query.trim()) {
      setFiltered(products);
      return;
    }
    const q = normalize(query);
    setFiltered(
      products.filter(
        (p) =>
          normalize(p.name_lv || '').includes(q) ||
          normalize(p.name_en || '').includes(q) ||
          normalize(p.sku || '').includes(q)
      )
    );
  }

  return (
    <>
      <BackButton href="/lv/categories" label="Kategorijas" />
      <Header title={category.name_lv} subtitle={category.name_en} />
      <SearchBar
        placeholder="Meklēt produktu..."
        onSearch={handleSearch}
      />
      <div className="pb-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:px-4">
        {filtered.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-brand-grey py-8">
            Nav atrasts neviens produkts
          </p>
        )}
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import CategoryCard from "./CategoryCard";
import SearchBar from "./SearchBar";
import Header from "./Header";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [filtered, setFiltered] = useState(categories);

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
      setFiltered(categories);
      return;
    }
    const q = normalize(query);
    setFiltered(
      categories.filter(
        (c) =>
          normalize(c.name_lv || '').includes(q) ||
          normalize(c.name_en || '').includes(q) ||
          c.number.includes(q)
      )
    );
  }

  return (
    <>
      <Header title="Kategorijas" />
      <SearchBar placeholder="Meklēt kategoriju..." onSearch={handleSearch} />
      <div className="px-4 pb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-brand-grey py-8">
            Nav atrasta neviena kategorija
          </p>
        )}
      </div>
    </>
  );
}

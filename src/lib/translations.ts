export type Locale = "lv" | "en";

export const translations = {
  lv: {
    categories: "Kategorijas",
    products: "Produkti",
    searchCategory: "Meklēt kategoriju...",
    searchProduct: "Meklēt produktu...",
    search: "Meklēt...",
    noCategories: "Nav atrasta neviena kategorija",
    noProducts: "Nav atrasts neviens produkts",
    notFound: "Nav atrasts",
    back: "Atpakaļ",
    prev: "Iepriekšējā",
    next: "Nākamā",
    totalProducts: "produkti kopā",
    productCount: "produkti",
    sku: "Artikuls",
    ean: "EAN",
    brand: "Zīmols",
    category: "Kategorija",
    aboutProduct: "Par produktu",
    inquireLg: "Uzzināt vairāk par produktu",
    inquireSm: "Uzzināt vairāk",
    emailSubject: (sku: string, name: string) => `Cenas pieprasījums: ${sku} – ${name}`,
    catalogTitle: "Labor Pro Katalogs",
    catalogDescription: "Labor Pro profesionālo skaistumkopšanas produktu katalogs",
  },
  en: {
    categories: "Categories",
    products: "Products",
    searchCategory: "Search category...",
    searchProduct: "Search product...",
    search: "Search...",
    noCategories: "No categories found",
    noProducts: "No products found",
    notFound: "Not found",
    back: "Back",
    prev: "Previous",
    next: "Next",
    totalProducts: "products total",
    productCount: "products",
    sku: "SKU",
    ean: "EAN",
    brand: "Brand",
    category: "Category",
    aboutProduct: "About this product",
    inquireLg: "Inquire about this product",
    inquireSm: "Learn more",
    emailSubject: (sku: string, name: string) => `Price inquiry: ${sku} – ${name}`,
    catalogTitle: "Labor Pro Catalog",
    catalogDescription: "Labor Pro professional beauty products catalog",
  },
} as const;

export interface Translations {
  categories: string;
  products: string;
  searchCategory: string;
  searchProduct: string;
  search: string;
  noCategories: string;
  noProducts: string;
  notFound: string;
  back: string;
  prev: string;
  next: string;
  totalProducts: string;
  productCount: string;
  sku: string;
  ean: string;
  brand: string;
  category: string;
  aboutProduct: string;
  inquireLg: string;
  inquireSm: string;
  emailSubject: (sku: string, name: string) => string;
  catalogTitle: string;
  catalogDescription: string;
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.lv;
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === "lv" || locale === "en";
}

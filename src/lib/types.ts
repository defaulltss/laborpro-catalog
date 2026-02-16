export interface Category {
  id: number;
  number: string;
  name_en: string;
  name_lv: string;
  slug: string;
  productCount: number;
}

export interface Product {
  id: number;
  sku: string;
  name_lv: string;
  name_en: string;
  description_lv: string;
  description_en: string;
  price: number | null;
  categoryId: number;
  categorySlug: string;
  brand: string;
  ean: string;
  images: string[];
}

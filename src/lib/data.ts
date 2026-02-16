import { Category, Product } from './types';
import fs from 'fs';
import path from 'path';

function loadJSON<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

let _categories: Category[] | null = null;
let _products: Product[] | null = null;

function getLoadedCategories(): Category[] {
  if (!_categories) {
    _categories = loadJSON<Category[]>('categories.json');
  }
  return _categories;
}

function getLoadedProducts(): Product[] {
  if (!_products) {
    _products = loadJSON<Product[]>('products.json');
  }
  return _products;
}

export function getCategories(): Category[] {
  return getLoadedCategories();
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getLoadedCategories().find((c) => c.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return getLoadedCategories().find((c) => c.id === id);
}

export const PRODUCTS_PER_PAGE = 24;

export function getProductsByCategory(categorySlug: string): Product[] {
  return getLoadedProducts().filter((p) => p.categorySlug === categorySlug);
}

export function getProductsByCategoryPaginated(
  categorySlug: string,
  page: number
): { products: Product[]; totalPages: number; totalProducts: number } {
  const all = getProductsByCategory(categorySlug);
  const totalProducts = all.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * PRODUCTS_PER_PAGE;
  const products = all.slice(start, start + PRODUCTS_PER_PAGE);
  return { products, totalPages, totalProducts };
}

export function getProductById(id: number): Product | undefined {
  return getLoadedProducts().find((p) => p.id === id);
}

export function searchProducts(
  query: string,
  categorySlug?: string
): Product[] {
  const q = query.toLowerCase();
  const pool = categorySlug
    ? getLoadedProducts().filter((p) => p.categorySlug === categorySlug)
    : getLoadedProducts();
  return pool.filter(
    (p) =>
      (p.name_lv || '').toLowerCase().includes(q) ||
      (p.name_en || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
  );
}

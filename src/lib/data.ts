import { Category, Product } from './types';
import { getHiddenProductIds } from './db';
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

/** Categories with product counts adjusted for hidden products */
export async function getCategoriesWithCounts(): Promise<Category[]> {
  const hidden = await getHiddenProductIds();
  const products = getLoadedProducts();
  const categories = getLoadedCategories();

  // Count visible products per category slug
  const counts = new Map<string, number>();
  for (const p of products) {
    if (!hidden.has(p.id)) {
      counts.set(p.categorySlug, (counts.get(p.categorySlug) || 0) + 1);
    }
  }

  return categories.map((c) => ({
    ...c,
    productCount: counts.get(c.slug) || 0,
  }));
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getLoadedCategories().find((c) => c.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return getLoadedCategories().find((c) => c.id === id);
}

export const PRODUCTS_PER_PAGE = 24;

/** All products unfiltered — used by admin panel */
export function getAllProducts(): Product[] {
  return getLoadedProducts();
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const hidden = await getHiddenProductIds();
  return getLoadedProducts().filter(
    (p) => p.categorySlug === categorySlug && !hidden.has(p.id)
  );
}

export async function getProductsByCategoryPaginated(
  categorySlug: string,
  page: number
): Promise<{ products: Product[]; totalPages: number; totalProducts: number }> {
  const all = await getProductsByCategory(categorySlug);
  const totalProducts = all.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * PRODUCTS_PER_PAGE;
  const products = all.slice(start, start + PRODUCTS_PER_PAGE);
  return { products, totalPages, totalProducts };
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const hidden = await getHiddenProductIds();
  const product = getLoadedProducts().find((p) => p.id === id);
  if (product && hidden.has(product.id)) return undefined;
  return product;
}

export async function searchProducts(
  query: string,
  categorySlug?: string
): Promise<Product[]> {
  const q = query.toLowerCase();
  const hidden = await getHiddenProductIds();
  const pool = categorySlug
    ? getLoadedProducts().filter((p) => p.categorySlug === categorySlug)
    : getLoadedProducts();
  return pool.filter(
    (p) =>
      !hidden.has(p.id) &&
      ((p.name_lv || '').toLowerCase().includes(q) ||
        (p.name_en || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q))
  );
}

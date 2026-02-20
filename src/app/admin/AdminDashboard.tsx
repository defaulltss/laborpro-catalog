'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category } from '@/lib/types';
import AdminToggle from './AdminToggle';
import AdminEditModal from './AdminEditModal';

const PRODUCTS_PER_PAGE = 50;

type FilterMode = 'all' | 'visible' | 'hidden';

interface AdminDashboardProps {
  baseProducts: Product[];
  initialVisibility: Record<number, boolean>;
  initialOverrides: Record<number, Record<string, unknown>>;
  categories: Category[];
}

export default function AdminDashboard({
  baseProducts,
  initialVisibility,
  initialOverrides,
  categories,
}: AdminDashboardProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState(initialVisibility);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(1);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function isVisible(productId: number): boolean {
    return visibility[productId] !== false;
  }

  // Merge overrides into base products for display
  const products = useMemo(() => {
    return baseProducts.map((p) => {
      const ov = overrides[p.id];
      if (!ov) return p;
      return { ...p, ...ov } as Product;
    });
  }, [baseProducts, overrides]);

  const filtered = useMemo(() => {
    let list = products;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name_lv || '').toLowerCase().includes(q) ||
          (p.name_en || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
      );
    }

    if (filter === 'visible') {
      list = list.filter((p) => isVisible(p.id));
    } else if (filter === 'hidden') {
      list = list.filter((p) => !isVisible(p.id));
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search, filter, visibility]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const pageProducts = filtered.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  const visibleCount = products.filter((p) => isVisible(p.id)).length;
  const hiddenCount = products.length - visibleCount;
  const editedCount = Object.keys(overrides).length;

  async function handleToggle(productId: number) {
    const newVisible = !isVisible(productId);
    setLoadingIds((prev) => new Set(prev).add(productId));

    try {
      const res = await fetch('/api/admin/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, visible: newVisible }),
      });

      if (res.ok) {
        setVisibility((prev) => ({ ...prev, [productId]: newVisible }));
      }
    } catch {
      // silently fail — toggle stays in old state
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  function handleEditSaved(productId: number, newOverrides: Record<string, unknown>) {
    setOverrides((prev) => {
      const next = { ...prev };
      if (Object.keys(newOverrides).length === 0) {
        delete next[productId];
      } else {
        next[productId] = newOverrides;
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  // Find the base product and current product for the edit modal
  const editingBase = editingProduct
    ? baseProducts.find((p) => p.id === editingProduct.id)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Product Admin</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/lv"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                       text-brand-grey transition-colors hover:bg-gray-100"
          >
            Catalog
          </Link>
          <Link
            href="/lv/categories"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                       text-brand-grey transition-colors hover:bg-gray-100"
          >
            Products
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                       text-brand-grey transition-colors hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-dark">{products.length}</p>
          <p className="text-sm text-brand-grey">Total Products</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{visibleCount}</p>
          <p className="text-sm text-brand-grey">Visible</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-500">{hiddenCount}</p>
          <p className="text-sm text-brand-grey">Hidden</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{editedCount}</p>
          <p className="text-sm text-brand-grey">Edited</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-brand-dark
                     focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
        />
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
          {(['all', 'visible', 'hidden'] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setFilter(mode);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors
                ${
                  filter === mode
                    ? 'bg-brand-pink text-brand-dark'
                    : 'text-brand-grey hover:text-brand-dark'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-brand-grey">
        Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </p>

      {/* Product table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-brand-grey">
              <th className="px-4 py-3">Product</th>
              <th className="hidden px-4 py-3 sm:table-cell">SKU</th>
              <th className="hidden px-4 py-3 md:table-cell">Category</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageProducts.map((product) => {
              const visible = isVisible(product.id);
              const hasOverrides = product.id in overrides;
              const thumb = product.images?.[0];
              return (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-dark line-clamp-1">
                          {product.name_lv || product.name_en || product.sku}
                        </span>
                        {hasOverrides && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            edited
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-brand-grey sm:table-cell">
                    {product.sku}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-brand-grey md:table-cell">
                    {product.categorySlug}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        visible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium
                                   text-brand-grey transition-colors hover:bg-gray-100 hover:text-brand-dark"
                      >
                        Edit
                      </button>
                      <AdminToggle
                        enabled={visible}
                        loading={loadingIds.has(product.id)}
                        onToggle={() => handleToggle(product.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-brand-grey">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-brand-dark
                       transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-brand-grey">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-brand-dark
                       transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && editingBase && (
        <AdminEditModal
          product={editingProduct}
          baseProduct={editingBase}
          overrides={overrides[editingProduct.id] || {}}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}

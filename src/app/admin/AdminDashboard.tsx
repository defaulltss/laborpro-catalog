'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import AdminToggle from './AdminToggle';

const PRODUCTS_PER_PAGE = 50;

type FilterMode = 'all' | 'visible' | 'hidden';

interface AdminDashboardProps {
  products: Product[];
  initialVisibility: Record<number, boolean>;
}

export default function AdminDashboard({
  products,
  initialVisibility,
}: AdminDashboardProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState(initialVisibility);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(1);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  function isVisible(productId: number): boolean {
    // Products with no row in visibility table are visible by default
    return visibility[productId] !== false;
  }

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

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

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
      <div className="mb-6 grid grid-cols-3 gap-4">
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
              <th className="px-4 py-3 text-center">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageProducts.map((product) => {
              const visible = isVisible(product.id);
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
                      <span className="text-sm font-medium text-brand-dark line-clamp-1">
                        {product.name_lv || product.name_en || product.sku}
                      </span>
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
                  <td className="px-4 py-3 text-center">
                    <AdminToggle
                      enabled={visible}
                      loading={loadingIds.has(product.id)}
                      onToggle={() => handleToggle(product.id)}
                    />
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
    </div>
  );
}

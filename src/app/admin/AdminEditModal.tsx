'use client';

import { useState } from 'react';
import { Product, Category } from '@/lib/types';

interface AdminEditModalProps {
  product: Product;
  baseProduct: Product;
  overrides: Record<string, unknown>;
  categories: Category[];
  onClose: () => void;
  onSaved: (productId: number, newOverrides: Record<string, unknown>) => void;
}

type EditableField = 'name_lv' | 'name_en' | 'description_lv' | 'description_en' | 'price' | 'brand' | 'ean' | 'categorySlug';

const FIELD_LABELS: Record<EditableField, string> = {
  name_lv: 'Name (LV)',
  name_en: 'Name (EN)',
  description_lv: 'Description (LV)',
  description_en: 'Description (EN)',
  price: 'Price',
  brand: 'Brand',
  ean: 'EAN',
  categorySlug: 'Category',
};

export default function AdminEditModal({
  product,
  baseProduct,
  overrides,
  categories,
  onClose,
  onSaved,
}: AdminEditModalProps) {
  // Initialize form values from the product (base + existing overrides)
  const [values, setValues] = useState<Record<EditableField, string>>({
    name_lv: product.name_lv || '',
    name_en: product.name_en || '',
    description_lv: product.description_lv || '',
    description_en: product.description_en || '',
    price: product.price != null ? String(product.price) : '',
    brand: product.brand || '',
    ean: product.ean || '',
    categorySlug: product.categorySlug || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function hasFieldOverride(field: EditableField): boolean {
    return field in overrides;
  }

  function getBaseValue(field: EditableField): string {
    if (field === 'price') {
      return baseProduct.price != null ? String(baseProduct.price) : '';
    }
    return String((baseProduct as unknown as Record<string, unknown>)[field] || '');
  }

  function resetField(field: EditableField) {
    setValues((prev) => ({ ...prev, [field]: getBaseValue(field) }));
  }

  function isFieldModified(field: EditableField): boolean {
    return values[field] !== getBaseValue(field);
  }

  function hasFieldIndicator(field: EditableField): boolean {
    // Show indicator if field has existing override OR is currently modified from base
    return hasFieldOverride(field) || isFieldModified(field);
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    // Build the overrides object: only fields that differ from base
    const newOverrides: Record<string, unknown> = {};
    const fields: EditableField[] = ['name_lv', 'name_en', 'description_lv', 'description_en', 'price', 'brand', 'ean', 'categorySlug'];

    for (const field of fields) {
      const currentValue = values[field];
      const baseValue = getBaseValue(field);

      if (currentValue !== baseValue) {
        if (field === 'price') {
          newOverrides.price = currentValue === '' ? null : Number(currentValue);
        } else if (field === 'categorySlug') {
          newOverrides.categorySlug = currentValue;
          // Also update categoryId to match the slug
          const cat = categories.find((c) => c.slug === currentValue);
          if (cat) {
            newOverrides.categoryId = cat.id;
          }
        } else {
          newOverrides[field] = currentValue;
        }
      }
    }

    try {
      if (Object.keys(newOverrides).length === 0 && Object.keys(overrides).length > 0) {
        // All fields reset to base — delete overrides
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to reset');
        onSaved(product.id, {});
      } else if (Object.keys(newOverrides).length > 0) {
        // Send full override set (replace, not merge)
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOverrides),
        });
        if (!res.ok) throw new Error('Failed to save');
        const data = await res.json();
        onSaved(product.id, data.overrides);
      } else {
        // No changes, just close
        onClose();
        return;
      }
      onClose();
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const thumb = product.images?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-brand-dark">
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product info (read-only) */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3">
          {thumb ? (
            <img src={thumb} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
              N/A
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-brand-dark line-clamp-1">
              {product.name_lv || product.name_en || product.sku}
            </p>
            <p className="text-xs text-brand-grey">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 px-6 py-4">
          {/* Text fields */}
          {(['name_lv', 'name_en'] as EditableField[]).map((field) => (
            <FieldRow key={field} label={FIELD_LABELS[field]} modified={hasFieldIndicator(field)}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={values[field]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm text-brand-dark
                    focus:outline-none focus:ring-2 focus:ring-brand-pink/30
                    ${hasFieldIndicator(field) ? 'border-amber-400' : 'border-gray-300'}`}
                />
                {hasFieldIndicator(field) && (
                  <ResetButton onClick={() => resetField(field)} />
                )}
              </div>
            </FieldRow>
          ))}

          {/* Textarea fields */}
          {(['description_lv', 'description_en'] as EditableField[]).map((field) => (
            <FieldRow key={field} label={FIELD_LABELS[field]} modified={hasFieldIndicator(field)}>
              <div className="flex gap-2">
                <textarea
                  value={values[field]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
                  rows={3}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm text-brand-dark
                    focus:outline-none focus:ring-2 focus:ring-brand-pink/30
                    ${hasFieldIndicator(field) ? 'border-amber-400' : 'border-gray-300'}`}
                />
                {hasFieldIndicator(field) && (
                  <ResetButton onClick={() => resetField(field)} />
                )}
              </div>
            </FieldRow>
          ))}

          {/* Price */}
          <FieldRow label={FIELD_LABELS.price} modified={hasFieldIndicator('price')}>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={values.price}
                onChange={(e) => setValues((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="No price"
                className={`flex-1 rounded-lg border px-3 py-2 text-sm text-brand-dark
                  focus:outline-none focus:ring-2 focus:ring-brand-pink/30
                  ${hasFieldIndicator('price') ? 'border-amber-400' : 'border-gray-300'}`}
              />
              {hasFieldIndicator('price') && (
                <ResetButton onClick={() => resetField('price')} />
              )}
            </div>
          </FieldRow>

          {/* Brand */}
          <FieldRow label={FIELD_LABELS.brand} modified={hasFieldIndicator('brand')}>
            <div className="flex gap-2">
              <input
                type="text"
                value={values.brand}
                onChange={(e) => setValues((prev) => ({ ...prev, brand: e.target.value }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm text-brand-dark
                  focus:outline-none focus:ring-2 focus:ring-brand-pink/30
                  ${hasFieldIndicator('brand') ? 'border-amber-400' : 'border-gray-300'}`}
              />
              {hasFieldIndicator('brand') && (
                <ResetButton onClick={() => resetField('brand')} />
              )}
            </div>
          </FieldRow>

          {/* EAN */}
          <FieldRow label={FIELD_LABELS.ean} modified={hasFieldIndicator('ean')}>
            <div className="flex gap-2">
              <input
                type="text"
                value={values.ean}
                onChange={(e) => setValues((prev) => ({ ...prev, ean: e.target.value }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm text-brand-dark
                  focus:outline-none focus:ring-2 focus:ring-brand-pink/30
                  ${hasFieldIndicator('ean') ? 'border-amber-400' : 'border-gray-300'}`}
              />
              {hasFieldIndicator('ean') && (
                <ResetButton onClick={() => resetField('ean')} />
              )}
            </div>
          </FieldRow>

          {/* Category dropdown */}
          <FieldRow label={FIELD_LABELS.categorySlug} modified={hasFieldIndicator('categorySlug')}>
            <div className="flex gap-2">
              <select
                value={values.categorySlug}
                onChange={(e) => setValues((prev) => ({ ...prev, categorySlug: e.target.value }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm text-brand-dark
                  focus:outline-none focus:ring-2 focus:ring-brand-pink/30
                  ${hasFieldIndicator('categorySlug') ? 'border-amber-400' : 'border-gray-300'}`}
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name_en || cat.name_lv}
                  </option>
                ))}
              </select>
              {hasFieldIndicator('categorySlug') && (
                <ResetButton onClick={() => resetField('categorySlug')} />
              )}
            </div>
          </FieldRow>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-brand-grey
                       transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-pink px-4 py-2 text-sm font-medium text-brand-dark
                       transition-colors hover:bg-brand-pink/80 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, modified, children }: { label: string; modified: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-2 text-sm font-medium text-brand-grey">
        {label}
        {modified && (
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            edited
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-gray-300 px-2 py-2 text-xs text-brand-grey
                 transition-colors hover:bg-gray-100"
      title="Reset to original"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}

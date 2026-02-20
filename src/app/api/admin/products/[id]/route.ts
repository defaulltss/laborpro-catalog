import { NextRequest, NextResponse } from 'next/server';
import { getProductOverrides, setProductOverrides, deleteProductOverrides } from '@/lib/db';

const ALLOWED_FIELDS = new Set([
  'name_lv',
  'name_en',
  'description_lv',
  'description_en',
  'price',
  'brand',
  'ean',
  'categoryId',
  'categorySlug',
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    // Validate field names
    const newFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_FIELDS.has(key)) {
        return NextResponse.json(
          { error: `Field "${key}" is not editable` },
          { status: 400 }
        );
      }
      newFields[key] = value;
    }

    if (Object.keys(newFields).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Merge with existing overrides for this product
    const existingMap = await getProductOverrides();
    const existing = existingMap.get(productId) || {};
    const merged = { ...existing, ...newFields };

    // Remove keys that are explicitly set to undefined (field reset)
    for (const key of Object.keys(merged)) {
      if (merged[key] === undefined) {
        delete merged[key];
      }
    }

    if (Object.keys(merged).length === 0) {
      await deleteProductOverrides(productId);
    } else {
      await setProductOverrides(productId, merged);
    }

    return NextResponse.json({ success: true, productId, overrides: merged });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update product overrides' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await deleteProductOverrides(productId);
    return NextResponse.json({ success: true, productId });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reset product overrides' },
      { status: 500 }
    );
  }
}
